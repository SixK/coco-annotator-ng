import { computed, ref, onMounted } from "vue";

export function useButton(){

  const color = {
    enabled: "white",
    active: "#2ecc71",
    disabled: "gray",
  };
    
    const iconColor = ref("");
    const delay = 400;
    
    const click = (execute, disabled) => {
        if (!disabled) {
          toggleAnimation();
          execute();
        }
    };
    
    const toggleAnimation = () => {
      iconColor.value = color.active;
      setTimeout(() => {
        iconColor.value = color.enabled;
      }, delay);
    };
    
    onMounted(() => {
      iconColor.value = color.enabled;
    });
    return {
      iconColor,
      click,
      // color,
    };

};
