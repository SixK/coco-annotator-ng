<template>
  <div>
    <i
      v-tooltip.right="name"
      class="fa fa-x fa-cog"
      style="color: white"
      data-bs-toggle="modal"
      data-bs-target="#settings"
    />

    <br>
    <!-- Modal -->
    <BaseModal
      id="settings"
      title="Image Settings"
    >
      <div class="form-group row">
        <label class="col-sm-2 col-form-label">Simplify</label>
        <div class="col-sm-9">
          <input
            v-model.number="simplify"
            type="number"
            class="form-control"
          >
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2 col-form-label">Annotate API</label>
        <div class="col-sm-9">
          <input
            v-model.number="annotateUrl"
            type="string"
            class="form-control"
          >
        </div>
      </div>

      <MetaData
        ref="metadata"
        :metadata="metadata"
      />

      <p style="margin: 30px 0 0 0">
        Keyboard Shortcuts
      </p>

      <div class="row">
        <div class="col-sm">
          <p class="subtitle">
            Operation
          </p>
        </div>
        <div class="col-sm">
          <p class="subtitle">
            Shortcut
          </p>
        </div>
      </div>

      <ul
        class="list-group"
        style="height: 50%"
      >
        <CustomShortcut
          v-for="(command, index) in commands"
          :key="index"
          ref="shortcuts"
          :shortcut="command"
        />
      </ul>
      <template #footer>
        <button
          type="button"
          class="btn btn-secondary"
          data-bs-dismiss="modal"
        >
          Close
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import MetaData from "@/components/MetaData.vue";
import CustomShortcut from "@/components/annotator/CustomShortcut.vue";
import BaseModal from "@/components/BaseModal";
import { ref, useTemplateRef } from 'vue';

const metadata = defineModel('metadata', { type: Object, required: true });
const commands = defineModel('commands', { type: Array, required: true });
const simplify = defineModel('simplify', { type: Number });
const annotateUrl = defineModel('annotateUrl', { type: null });

const name = ref("Image Settings");
const shortcuts = useTemplateRef('shortcuts');

const exportMetadata = () => {
    // return props.$refs.metadata.export();
    // return {};
    return metadata.value.exportMetadata();
};

const setPreferences = (preferences) => {   
    commands.value.forEach((shortcut) => {
        preferences.shortcuts.forEach((pref) => {
            if (shortcut.name == pref.name) {
                shortcut.default = pref.keys;
            }
        });
    });
}

const exportSettings = () => {
      let data = { shortcuts: [] };
      
      // shortcuts.value.shortcuts.forEach((shortcut) => {
      shortcuts.value.forEach((shortcut) => {
          data.shortcuts.push(shortcut.myexport());
      });
      return data;
};

defineExpose({exportSettings, exportMetadata, setPreferences});

</script>

<style scoped>
.subtitle {
  margin: 0;
  font-size: 10px;
}
</style>
