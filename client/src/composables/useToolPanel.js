// useToolPanel.js
import { computed } from 'vue'

import KeypointPanel  from '@/components/annotator/panels/KeypointPanel.vue'
import BBoxPanel      from '@/components/annotator/panels/BBoxPanel.vue'
import PolygonPanel   from '@/components/annotator/panels/PolygonPanel.vue'
import SelectPanel    from '@/components/annotator/panels/SelectPanel.vue'
import MagicWandPanel from '@/components/annotator/panels/MagicWandPanel.vue'
import BrushPanel     from '@/components/annotator/panels/BrushPanel.vue'
import EraserPanel    from '@/components/annotator/panels/EraserPanel.vue'
import DEXTRPanel     from '@/components/annotator/panels/DEXTRPanel.vue'
import Sam2Panel      from '@/components/annotator/panels/Sam2Panel.vue'

import { useAnnotationStore } from '@/store/annotation';

import { useToolStore } from '@/store/toolStore';

export default function useToolPanel(toolspanelRef) {
  /* ---------- panel map ---------- */
const toolStore = useToolStore();
const store = useAnnotationStore();

const panelMap = {
  bbox:      BBoxPanel,
  polygon:   PolygonPanel,
  select:    SelectPanel,
  magicwand: MagicWandPanel,
  brush:     BrushPanel,
  eraser:    EraserPanel,
  keypoint:  KeypointPanel,
  dextr:     DEXTRPanel,
  sam2:      Sam2Panel,
}

  const toolInst = name => toolspanelRef.value?.[name]

  const currentPanel = computed(() => {
    const name = toolStore.activeTool?.toLowerCase();
    if (!name || !toolInst(name)) return null
    return panelMap[name]
  })

  const panelProps = computed(() => {
    const tool = toolStore.activeTool?.toLowerCase();
    if (!tool) return {}

    if (tool === 'keypoint') {
      return {
        keypoint: toolInst('keypoint'),
        'current-annotation': store.currentAnnotation?.value,
      }
    }
    return { [tool]: toolInst(tool) }
  })

  return { currentPanel, panelProps, toolInst }
}
