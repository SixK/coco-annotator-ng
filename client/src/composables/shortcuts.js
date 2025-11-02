import { reactive, ref, onMounted, inject} from "vue";
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { useProcStore } from "@/store/index";

export default function useShortcuts(moveUp, moveDown, stepIn, stepOut, 
                                                                                createAnnotation, deleteAnnotation,
                                                                                setActiveTool, nextImage, previousImage,
                                                                                fit, save, doShortcutAction) {
  const route = useRoute();
  const router = useRouter();
  const commands = ref([]);

  const procStore = useProcStore();

  const undo = () => {
      procStore.doUndo();
  }
  
  const safeSave = async () => {
  try {
    if (typeof save === 'function') {
      await save();
    }
    // Force reload after successful save.
    setTimeout(() => {
        router.go(0);
    }, 200); // need to wait axios has finished :(
  } catch (err) {
    console.error('Error saving:', err);
    // Optionally show a notification to user
  }
}
    const annotator = (() =>  {
        return [
        {
            title: "General",
            default: ["arrowup"],
            function: moveUp,
            name: "Move Up Annotations",
         },
        {
          default: ["arrowdown"],
          function: moveDown,
          name: "Move Down Annotations",
        },
        {
          default: ["arrowright"],
          function: stepIn,
          name: "Expand Category",
        },
        {
          default: ["arrowleft"],
          function: stepOut,
          name: "Collapse Category",
        },
        {
          default: ["space"],
          name: "New Annotation",
          function: createAnnotation
        },
        {
          default: ["backspace"],
          name: "Delete Current Annotation",
          function: deleteAnnotation,
        },
        {
          default: ["control", "z"],
          name: "Undo Last Action",
          function: undo,
        },
        {
          default: ["s"],
          name: "Select Tool",
          function: () => {
            setActiveTool("Select");
          },
        },
        {
          default: ["r"],
          name: "BBox Tool",
          function: () => {
              setActiveTool("BBox");
            // if (!$refs.polygon.isDisabled) activeTool = "BBox";
          },
        },
        {
          default: ["n"],
          name: "Next Image",
          function: nextImage,
        },
        {
          default: ["p"],
          name: "Previous Image",
          function: previousImage,
        },
        {
          default: ["v"],
          name: "Polygon Tool",
          function: () => {
              setActiveTool("Polygon");
            // if (!$refs.polygon.isDisabled) activeTool = "Polygon";
          },
        },
        {
          default: ["w"],
          name: "Magic Wand Tool",
          function: () => {
            // if (!$refs.magicwand.isDisabled)
              setActiveTool("Magic Wand");
          },
        },
        {
          default: ["k"],
          name: "Keypoints Tool",
          function: () => {
            // if (!$refs.magicwand.isDisabled) activeTool = "Keypoints";
            setActiveTool("Keypoints");
          },
        },
        {
          default: ["b"],
          name: "Brush Tool",
          function: () => {
            // if (!$refs.brush.isDisabled) activeTool = "Brush";
                setActiveTool("Brush");
          },
        },
        {
          default: ["e"],
          name: "Eraser Tool",
          function: () => {
            // if (!$refs.eraser.isDisabled) activeTool = "Eraser";
            setActiveTool("Eraser");
          },
        },
        {
          default: ["c"],
          name: "Center Image",
          function: fit,
        },
        {
          default: ["control", "s"],
          name: "Save",
          function: safeSave,
        },
        {
          title: "BBox Tool Shortcuts",
          default: ["escape"],
          name: "Remove Current BBox",
          function: () => {
                    doShortcutAction("cancelBbox");
              },
        },
        {
          title: "Polygon Tool Shortcuts",
          default: ["escape"],
          name: "Remove Current Polygon",
          function: () => {
                    doShortcutAction("cancelPolygon");
              },
        },
        {
          title: "Eraser Tool Shortcuts",
          default: ["["],
          name: "Increase Radius",
          function: () => {
                    doShortcutAction("eraserIncreaseRadius");
              },
        },
        {
          default: ["]"],
          name: "Decrease Radius",
          function: () => {
                    doShortcutAction("eraserDecreaseRadius");
              },
        },
        {
          title: "Brush Tool Shortcuts",
          default: ["["],
          name: "Increase Radius",
          function: () => {
                    doShortcutAction("brushIncreaseRadius");
              },
        },
        {
          default: ["]"],
          name: "Decrease Radius",
          function: () => {
                    doShortcutAction("brushDecreaseRadius");
              },
        },
        {
          title: "Magic Tool Shortcuts",
          default: ["shift", "click"],
          name: "Subtract Selection",
          readonly: true,
        },
        ];
      });

    
    onMounted(() => {
        if (route.name === "annotate") {
            commands.value = annotator();
        }
    });
    
  return {
    commands,
    undo,
    annotator,
  };
}
