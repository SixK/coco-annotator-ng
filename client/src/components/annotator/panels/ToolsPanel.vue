<template>
  <div v-show="mode === 'segment'" class="tools-panel">
    <hr />
    <SelectTool
      ref="select"
      :scale="image.scale"
      :categories="categories"
      @setcursor="setCursor"
    />
    <hr />
    <BBoxTool
      ref="bbox"
      :scale="image.scale"
      @setcursor="setCursor"
    />

    <PolygonTool
      ref="polygon"
      :scale="image.scale"
      @setcursor="setCursor"
    />

    <MagicWandTool
      ref="magicwand"
      :width="image.raster.width"
      :height="image.raster.height"
      :image-data="image.data"
      @setcursor="setCursor"
    />

    <BrushTool
      ref="brush"
      :scale="image.scale"
      @setcursor="setCursor"
    />

    <EraserTool
      ref="eraser"
      :scale="image.scale"
      @setcursor="setCursor"
    />

    <KeypointTool
      ref="keypoint"
      @setcursor="setCursor"
    />

    <DEXTRTool
      ref="dextr"
      :scale="image.scale"
      @setcursor="setCursor"
    />

    <SamTool
      ref="sam"
      :scale="image.scale"
      @setcursor="setCursor"
    />

    <Sam2Tool
      ref="sam2"
      :scale="image.scale"
      @setcursor="setCursor"
    />

    <ZimTool
      ref="zim"
      :scale="image.scale"
      @setcursor="setCursor"
    />
  </div>
</template>

<script setup>
import SelectTool from "@/components/annotator/tools/SelectTool";
import BBoxTool from "@/components/annotator/tools/BBoxTool";
import PolygonTool from "@/components/annotator/tools/PolygonTool";
import MagicWandTool from "@/components/annotator/tools/MagicWandTool";
import EraserTool from "@/components/annotator/tools/EraserTool";
import BrushTool from "@/components/annotator/tools/BrushTool";
import KeypointTool from "@/components/annotator/tools/KeypointTool";
import DEXTRTool from "@/components/annotator/tools/DEXTRTool";
import SamTool from "@/components/annotator/tools/SamTool";
import Sam2Tool from "@/components/annotator/tools/Sam2Tool";
import ZimTool from "@/components/annotator/tools/ZimTool";

import { useTemplateRef, inject, watch } from "vue";

const { getImageRaster } = inject('annotator');

// const activeTool = defineModel('activeTool', { type: String, required: true });
const image = defineModel('image', { type: Object, required: true });
const categories = defineModel('categories', { type: Array, required: true });
const mode = defineModel('mode', { type: String, required: true });

const emit = defineEmits(["setcursor"]);

// template refs: only read through exported getters/methods (never written to),
// so useTemplateRef()'s readonly ref is safe here.
const select    = useTemplateRef('select');
const bbox      = useTemplateRef('bbox');
const polygon   = useTemplateRef('polygon');
const magicwand = useTemplateRef('magicwand');
const brush     = useTemplateRef('brush');
const eraser    = useTemplateRef('eraser');
const keypoint  = useTemplateRef('keypoint');
const dextr     = useTemplateRef('dextr');
const sam2      = useTemplateRef('sam2');
// const settings = useTemplateRef('settings');

const exportUserTools = () => ({
  bbox: bbox.value.exportBBox(),
  polygon: polygon.value.exportPolygon(),
  eraser: eraser.value.exportEraser(),
  brush: brush.value.exportBrush(),
  magicwand: magicwand.value.exportWand(),
  select: select.value.exportSelect(),
  // settings: settings.value.exportSettings()
});

const setCursor = (newCursor) => {
  emit("setcursor", newCursor);
};

watch(
  () => getImageRaster(),
  (value) => {
      image.value.raster = value;
  }
);

const setPreferences = (preferences) => {
      bbox.value.setPreferences(preferences.bbox || preferences.polygon || {});
      polygon.value.setPreferences(preferences.polygon || {});
      select.value.setPreferences(preferences.select || {});
      magicwand.value.setPreferences(preferences.magicwand || {});
      brush.value.setPreferences(preferences.brush || {});
      eraser.value.setPreferences(preferences.eraser || {});
};

defineExpose({exportUserTools, bbox, polygon, select, 
                              eraser, brush, magicwand, keypoint, dextr, 
                              setPreferences, sam2});


</script>

<style scoped>
.tools-panel {
  display: flex;
  flex-direction: column;
}
</style>
