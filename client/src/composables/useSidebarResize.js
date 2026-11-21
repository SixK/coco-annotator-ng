import { onMounted, onUnmounted, ref, watch } from "vue";

import { SURFACE_DARK } from "@/libs/theme";

// Sidebar resize state used by `views/Dataset.vue` (and `views/Annotator.vue`
// if it ever needs the same behaviour). Kept as a composable so the view only
// deals with the dataset data itself.

const SIDEBAR_WIDTH_KEY = "dataset/sideWidth";
const MIN_WIDTH = 150;
const EDGE_TOLERANCE = 4;
const DEFAULT_WIDTH_RATIO = 0.2;
const MAX_WIDTH_RATIO = 0.5;

export default function useSidebarResize() {
  const sidebar = ref({
    drag: false,
    width: window.innerWidth * DEFAULT_WIDTH_RATIO,
    canResize: false,
  });
  const mouseDown = ref(false);

  const mouseMove = (event) => {
    const element = document.querySelector(".sidebar");
    const sidebarWidth = element.offsetWidth;
    const clickWidth = event.x;
    const pixelsFromSide = Math.abs(sidebarWidth - clickWidth);
    sidebar.value.drag = pixelsFromSide < EDGE_TOLERANCE;
    if (sidebar.value.canResize) {
      event.preventDefault();
      const max = window.innerWidth * MAX_WIDTH_RATIO;
      sidebar.value.width = Math.min(Math.max(event.x, MIN_WIDTH), max);
      localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebar.value.width);
    }
  };

  const startDrag = () => {
    mouseDown.value = true;
    sidebar.value.canResize = sidebar.value.drag;
  };

  const stopDrag = () => {
    mouseDown.value = false;
    sidebar.value.canResize = false;
  };

  const restoreWidth = () => {
    const sideWidth = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    if (sideWidth !== null) sidebar.value.width = parseInt(sideWidth);
  };

  watch(
    () => sidebar.value.drag,
    (canDrag) => {
      const el = document.querySelector(".sidebar");
      if (canDrag) {
        document.body.style.cursor = "ew-resize";
        el.style.borderRight = `4px solid ${SURFACE_DARK}`;
      } else {
        document.body.style.cursor = "default";
        el.style.borderRight = "";
      }
    }
  );

  onMounted(() => {
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("mousedown", startDrag);
    restoreWidth();
  });

  onUnmounted(() => {
    window.removeEventListener("mouseup", stopDrag);
    window.removeEventListener("mousedown", startDrag);
  });

  return { sidebar, mouseMove, startDrag, stopDrag };
}
