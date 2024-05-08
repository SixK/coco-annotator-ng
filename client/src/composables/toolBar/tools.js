import { ref, watch, onMounted, reactive,computed, inject, watchEffect } from 'vue';
import paper from 'paper';

export  function useTools() {

const setCursor = inject('setCursor');
const getActiveTool = inject('getActiveTool');
const setActiveTool = inject('setActiveTool');
const current=inject('current');

const state = reactive({
    isActive: false,
    isDisabled: true,
    tool: null,
});
const name  = ref('');
const selected = ref('Select');

const cursor = ref('default');
const color = {
    enabled: 'white',
    active: '#2ecc71',
    disabled: 'gray',
    toggle: 'red',
};

const onMouseMove = () => {};
const onMouseDown = () => {};
const onMouseDrag = () => {};
const onMouseUp = () => {};


watchEffect(() => {
    console.log('active tool:',getActiveTool(), name.value);
    if (name.value !== getActiveTool()) {
        state.isActive = false;
        console.log('disabled all 2');
    }else{
        if(!state.isDisabled){
           setCursor(cursor.value);
           setActiveTool(name.value);
           state.isActive = true;
        }
    }
});

// handle case we change Category or first connection
// disable state change
watch( 
    () => state.isDisabled, 
   (disabled) => {
       if (disabled && name.value === "Select") {
           state.isActive = true;
           setCursor(cursor.value);
           setActiveTool('Select');
       }
       
       let tool = localStorage.getItem("editorTool") || "Select";
       if (!disabled && name.value === tool) {
           state.isActive = true;
           setCursor(cursor.value);
           setActiveTool(tool);
       }
   }
);

watchEffect(() => {
      console.log('lol:', current.annotation);
      state.isDisabled = current.annotation === -1;
      if(state.isDisabled) {
          state.isActive = false;
          
          if(name.value === 'Select') {
                setCursor(cursor.value);
                setActiveTool('Select');
                // emit('update', 'Select');
          }
      } 
});


const click = () => {
    if (name.value === 'Select') localStorage.setItem('editorTool', name.value);
    update()
};

const update = () => {
    if (state.isDisabled) return
    selected.value = name.value;
    setCursor(cursor.value);
    setActiveTool(name.value);
    state.isActive = true;
    state.isDisabled = false;
    console.log('active in tool', state.isActive, name.value);
};
const setPreferences = () => {};


const iconColor = computed(() => {
    console.log('change color:', state.isDisabled, state.isActive);
    if (state.isDisabled) return color.disabled
    // next line disabled isToggled seem's defined nowhere
    // if (props.isToggled) return props.color.toggle;
    if (state.isActive) return color.active
    return color.enabled
});

const tooltip = computed(() => {
    if (state.isDisabled) {
      return name.value + ' (select an annotation to activate tool)'
    }
    return name.value + ' Tool'
});

watch(
    () => state.isDisabled,
    (disabled) => {
      console.log('disabled !!! :', disabled, state.isActive, name.value);
      
      if (disabled && name.value === 'Select') {
            console.log('need to emit isDisabled...:', name.value);
      }
    }
);

watch(
  () => state.isActive, 
  (active) => {
      if (active) {
        if(state.tool)  {
            state.tool.activate();
            localStorage.setItem('editorTool', name.value);
        }
      }
});

onMounted(() => {
    state.tool = new paper.Tool();
    /*
    state.tool.onMouseDown = onMouseDown;
    state.tool.onMouseDrag = onMouseDrag;
    state.tool.onMouseMove = onMouseMove;
    state.tool.onMouseUp = onMouseUp;
    */
});
    
  return {
    click,
    state,
    iconColor,
    tooltip,
    name,
    cursor
  };
}
