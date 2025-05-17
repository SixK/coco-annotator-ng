// composables/useCanvas.js

import { ref } from 'vue';
import paper from 'paper';

export default function useCanvas(image, activeTool, current, procStore) {
  const canvas = ref(null);
  const zoomLevel = ref(0.2);
  const imageRaster = ref(null);

  const textElements = {
    topLeft: null,
    topRight: null
  };

  function updateImageName(filename) {
    if (textElements.topLeft != null) {
      textElements.topLeft.content = filename;
    }
  };

  function getImageRaster() {
    return imageRaster.value;
  };

  // Get canvas element by ID
  function getCanvasElement() {
    return document.getElementById("editor");
  }

  // Initialize Paper.js environment
  function setupPaper(canvasElement) {
    if (!canvasElement) return;
    paper.setup(canvasElement);
    paper.view.zoom = zoomLevel.value;
    paper.activate();
  }

  function getPaper(){
    return paper;
  };

  // Load image into Paper.js
  function loadImageAndSetupText(processName) {
    const img = new paper.Raster(image.value.url);
    img.onLoad = () => handleImageLoad(processName, img);
    imageRaster.value = img;
  }

function extractImageData(width, height){
  const tempCtx = document.createElement("canvas").getContext("2d");
  tempCtx.canvas.width = width;
  tempCtx.canvas.height = height;
  tempCtx.drawImage(imageRaster.value.image, 0, 0);

  image.value.data = tempCtx.getImageData(0, 0, width, height);
};

  // Handle post-load logic for image
  function handleImageLoad(processName, img) {
    const width = img.width;
    const height = img.height;

    img.sendToBack();
    fit(); // Call fit after load

    extractImageData(width, height);
    createTopLeftText(width, height);
    createTopRightText(width, height);

    removeProcessFromStore(processName);
  }

  // Remove process from store after load
  function removeProcessFromStore(processName) {
    procStore.removeProcess(processName);
  }

  // Fit view to canvas size
  function fit() {
    const canvasEl = getCanvasElement();
    if (!canvasEl || !imageRaster.value) return;

    const width = imageRaster.value.width;
    const height = imageRaster.value.height;

    const zoomX = canvasEl.width / width * 0.95;
    const zoomY = canvasEl.height / height * 0.8;
    const zoom = Math.min(zoomX, zoomY);

    paper.view.zoom = zoom;
    paper.view.center = new paper.Point(0, 0);
    image.value.scale = 1 / zoom;
  }

  // Create top-left text overlay (filename)
  function createTopLeftText(width, height) {
    if (textElements.topLeft) {
      textElements.topLeft.remove();
    }

    const fontSize = width * 0.025;
    const position = new paper.Point(-width / 2, -height / 2 - fontSize * 0.5);

    textElements.topLeft = new paper.PointText(position);
    textElements.topLeft.fontSize = fontSize;
    textElements.topLeft.fillColor = "white";
    textElements.topLeft.content = image.value.filename;
    console.log('image name:', image.value.filename);
  }

  // Create top-right text overlay (image dimensions)
  function createTopRightText(width, height) {
    if (textElements.topRight) {
      textElements.topRight.remove();
    }

    const fontSize = width * 0.025;
    const position = new paper.Point(width / 2, -height / 2 - fontSize * 0.4);

    textElements.topRight = new paper.PointText(position);
    textElements.topRight.justification = "right";
    textElements.topRight.fontSize = fontSize;
    textElements.topRight.fillColor = "white";
    textElements.topRight.content = `${width}x${height}`;
  }

  // Zoom in/out with mouse wheel
  function onWheel(event) {
    event.preventDefault();

    const view = paper.view;
    const viewPosition = view.viewToProject(new paper.Point(event.offsetX, event.offsetY));
    const transform = changeZoom(event.deltaY, viewPosition);

    if (transform.zoom < 10 && transform.zoom > 0.01) {
      image.value.scale = 1 / transform.zoom;
      view.zoom = transform.zoom;
      view.center = view.center.add(transform.offset);
    }
  }

  // Calculate new zoom level based on delta
  function changeZoom(delta, p) {
    const oldZoom = paper.view.zoom;
    const factor = 1 + zoomLevel.value;
    const newZoom = delta < 0 ? oldZoom * factor : oldZoom / factor;
    const beta = oldZoom / newZoom;
    const pc = p.subtract(paper.view.center);
    const offset = p.subtract(pc.multiply(beta)).subtract(paper.view.center);

    return { zoom: newZoom, offset };
  }

  // Handle pinch gesture start
  function onPinchStart(event) {
    event.preventDefault();
    pinching.value.old_zoom = paper.view.zoom;
  }

  // Handle pinch gesture
  function onPinch(event) {
    event.preventDefault();

    const view = paper.view;
    const viewPosition = view.viewToProject(
      new paper.Point(event.center.x, event.center.y)
    );

    const currZoom = event.scale * pinching.value.old_zoom;
    const beta = view.zoom / currZoom;
    const pc = viewPosition.subtract(view.center);
    const a = viewPosition.subtract(pc.multiply(beta)).subtract(view.center);

    const transform = { zoom: currZoom, offset: a };

    if (transform.zoom < 10 && transform.zoom > 0.01) {
      image.value.scale = 1 / transform.zoom;
      view.zoom = transform.zoom;
      view.center = view.center.add(transform.offset);
    }
  }

  // Initialize canvas
  function initCanvas(processName) {
    addProcessToStore(processName);
    const canvasElement = getCanvasElement();
    setupPaper(canvasElement);
    loadImageAndSetupText(processName);
  }

  // Add process to store
  function addProcessToStore(processName) {
    procStore.addProcess(processName);
  }

  // Exposed methods
  return {
    getCanvasElement,
    setupPaper,
    onWheel,
    onPinchStart,
    onPinch,
    fit, 
    initCanvas, 
    getImageRaster,
    updateImageName,
    getPaper
  };
}
