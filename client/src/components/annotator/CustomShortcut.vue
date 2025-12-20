<template>
  <div>
    <div
      v-if="shortcut.title != null"
      class="bg-light"
      style="font-size: 13px"
    >
      {{ shortcut.title }}
    </div>
    <div
      class="row"
      style="cell"
    >
      <div class="col-sm text-left">
        {{ shortcut.name }}
        <p
          v-show="readonly"
          class="mute"
        >
          (readonly)
        </p>
      </div>

      <div class="col-sm">
        <input
          :id="_uid"
          :value="keys.join('+').toUpperCase()"
          type="text"
          class="input"
          :readonly="readonly"
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, toRef, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const props = defineProps({
  shortcut: {
    type: Object,
    required: true,
  },
});

const _uid = ref(`input-${Date.now()}-${Math.random()}`);
const keys = toRef(props.shortcut, 'default');

const keysDown = ref([]);
const readonly = ref(props.shortcut.readonly == null ? false : props.shortcut.readonly);
const toggleKey = computed(() => {
  return keysDown.value.toString().replace(/,/g, '+');
});

const compkeys = computed (() => {
    return props.shortcut.default;
});


watch(
    () => compkeys.value,
    () => {
        keys.value =  compkeys.value;
    }
);

const myexport = (() => {
      return {
        name: props.shortcut.name,
        keys: keys.value,
      };
});

const myfunction = ((e) => {
      const target = e.target.tagName.toLowerCase();

      if (target === "input") return;
      if (target === "textarea") return;

      e.preventDefault();
      props.shortcut.function();
});

const keyCorrections = ((key) => {
      if (key == " ") return "space";
      return key;
});

const onKeyup = ((e) => {
      window.addEventListener('keyup: ', e, onKeyup);
      const key = keyCorrections(e.key.toLowerCase());
      // if (key === " ") key = "space";
      keysDown.value = keysDown.value.filter((a) => a !== key);
});
const onKeydown = ((e) => {
      if (readonly.value) {
        return;
      }

      const key = keyCorrections(e.key.toLowerCase());

      if (keysDown.value.indexOf(key) === -1) {
        keysDown.value.push(key);
      }

      if (e.target.id === _uid.value) {
        e.preventDefault();
        keys.value = keysDown.value;
      } else if (route.name === "annotate") {
        if (keysDown.value.sort().join(",") === keys.value.sort().join(",")) {
          myfunction(e);
        }
      }
});

onMounted(() => {
  window.addEventListener('keyup', onKeyup);
  window.addEventListener('keydown', onKeydown);
});
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  window.removeEventListener('keyup', onKeyup);
});

defineExpose({myexport});

</script>

<style scoped>
.input {
  padding: 3px;
  background-color: inherit;
  width: 100%;
  height: 100%;
  border: none;
  text-align: center;
}
.mute {
  color: gray;
  font-size: 11px;
  display: inline;
}
</style>
