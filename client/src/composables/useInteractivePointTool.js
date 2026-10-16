// composables/useInteractivePointTool.js
//
// Shared implementation of the "click points on the image, ask a segmentation
// model, unite its answer into the current annotation" tools: SAM, SAM2, ZIM
// and DEXTR. Those four components were four copies of the same script; only
// the tool name, the model endpoint, the number of clicks that triggers the
// request and the default settings differ.

import paper from "paper";
import axios from "axios";
import { ref, computed, inject, onMounted } from "vue";

import { useTools } from "./toolBar/tools";

/**
 * @param {Object} config
 * @param {string}   config.name              tool name shown in the toolbar ("SAM", ...)
 * @param {string}   config.icon              icon class of the toolbar button
 * @param {string}   config.endpoint          segmentation model endpoint
 * @param {number}   [config.triggerPoints=1] clicks required before querying the model
 * @param {Object}   [config.defaultSettings] initial settings, sent along with the points
 */
export function useInteractivePointTool({
  name: toolName,
  icon,
  endpoint,
  triggerPoints = 1,
  defaultSettings = {},
}) {
  const { getCurrentAnnotation, getImageRaster } = inject("annotator");

  const { click, state, iconColor, tooltip, name, cursor } = useTools();

  name.value = toolName;
  cursor.value = "crosshair";

  const settings = ref({ ...defaultSettings });
  const points = ref([]);

  const localCurrentAnnotation = computed(() => getCurrentAnnotation());
  const localImageRaster = computed(() => getImageRaster());

  function createPoint(point) {
    const paperPoint = new paper.Path.Circle(point, 5);
    paperPoint.fillColor = localCurrentAnnotation.value.color;
    paperPoint.data.point = point;
    points.value.push(paperPoint);
  }

  function onMouseDown(event) {
    if (!state.isActive) return;
    createPoint(event.point);
    checkPoints(points.value);
  }

  function createPath(segments, width, height) {
    const center = new paper.Point(width, height);
    const compoundPath = new paper.CompoundPath();
    segments.forEach((polygon) => {
      const path = new paper.Path();
      for (let j = 0; j < polygon.length; j += 2) {
        const point = new paper.Point(polygon[j], polygon[j + 1]);
        path.add(point.subtract(center));
      }
      path.closePath();
      compoundPath.addChild(path);
    });
    return compoundPath;
  }

  function pointsList(width, height) {
    return points.value.map((point) => {
      const pt = point.position;
      return [Math.round(width + pt.x), Math.round(height + pt.y)];
    });
  }

  function clearPoints() {
    points.value.forEach((point) => point.removeSegments());
    points.value = [];
  }

  // original code was watching for new points, but it seem's to be a bug between
  // Vue3 and paper.js. so we call function directly
  function checkPoints() {
    if (points.value.length !== triggerPoints) return;

    const currentAnnotation = localCurrentAnnotation.value;
    const width = localImageRaster.value.width / 2;
    const height = localImageRaster.value.height / 2;

    const data = new FormData();
    data.append("data", JSON.stringify({ points: pointsList(width, height), ...settings.value }));

    getImageRaster().canvas.toBlob((blob) => {
      data.append("image", blob);

      axios
        .post(endpoint, data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          // `segmentaiton` is the field name sent by the model backend
          const compoundPath = createPath(response.data.segmentaiton, width, height);
          currentAnnotation.unite(compoundPath);
        })
        .finally(() => {
          clearPoints();
        });
    });
  }

  onMounted(() => {
    state.tool.onMouseDown = onMouseDown;
  });

  return { click, icon, iconColor, tooltip, name, points, settings };
}
