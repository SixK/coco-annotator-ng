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
          :id="uid"
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
import { ref, computed, onMounted, onUnmounted, useId } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const { shortcut } = defineProps({
  shortcut: {
    type: Object,
    required: true,
  },
});

const uid = useId();
const keys = computed({
  get: () => shortcut.default,
  /* eslint-disable-next-line vue/no-mutating-props -- same write as the former
     toRef(props.shortcut, 'default'); the compiler rejects toRef() on a
     destructured prop. Replace with an emit in phase 3. */
  set: (value) => { shortcut.default = value; },
});

const keysDown = ref([]);
const readonly = ref(shortcut.readonly == null ? false : shortcut.readonly);
const toggleKey = computed(() => {
  return keysDown.value.toString().replace(/,/g, '+');
});

const myexport = (() => {
      return {
        name: shortcut.name,
        keys: keys.value,
      };
});

const myfunction = ((e) => {
      const target = e.target.tagName.toLowerCase();

      if (target === "input") return;
      if (target === "textarea") return;

      e.preventDefault();
      shortcut.function();
});

const keyCorrections = ((key) => {
      if (key == " ") return "space";
      return key;
});

const onKeyup = ((e) => {
      const key = keyCorrections(e.key.toLowerCase());
      // if (key === " ") key = "space";
      keysDown.value = keysDown.value.filter((a) => a !== key);
});
const onKeydown = ((e) => {
      if (readonly.value) return;

      const key = keyCorrections(e.key.toLowerCase());

      if (keysDown.value.indexOf(key) === -1) {
        keysDown.value.push(key);
      }

      if (e.target.id === uid) {
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
