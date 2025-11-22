import { ref, computed, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/store/user';
import { useProcStore } from '@/store/index';
import { useInfoStore } from '@/store/info';

export default function useAnnotatorState(props = {}, image) {
  // stores
  const authStore = useAuthStore();
  const procStore = useProcStore();
  const infoStore = useInfoStore();

  const categories = ref([]);
  const dataset = ref({ annotate_url: '' });

  const loading = reactive({ image: true, data: true, loader: null });

  const panels = ref({
    show: { left: true, right: true },
  });

  const current = ref({ category: -1, annotation: -1, keypoint: -1 });
  const hover = ref({ category: -1, annotation: -1, keypoint: -1 });

  const annotating = ref([]);
  const search = ref('');
  const shapeOpacity = ref(0.6);
  const simplify = ref(1);
  const cursor = ref('move');
  const activeTool = ref('Select');

  // refs for template components (exposed)
  const refsForTemplate = {
    refcanvas: ref(null),
    settings: ref(null),
    toolspanel: ref(null),
    filetitle: ref(null),
    categorylist: ref([]),
    zoom: ref(0.2),
    /* expose commonly used refs so SFC doesn't import them from this file */
  };

  const helpers = {
    removeFromAnnotatingList: () => {
      const user = authStore.user;
      if (!user) return;
      const idx = annotating.value.indexOf(user.username);
      if (idx > -1) annotating.value.splice(idx, 1);
    },

    onCategoryClick: (indices) => {
      // simplified: set current indices and delegate more complex behavior to other composables if necessary
      current.value.annotation = indices.annotation ?? -1;
      current.value.category = indices.category ?? -1;

      if (indices.hasOwnProperty('keypoint')) {
        current.value.keypoint = indices.keypoint;
        // to keep the composable lean, consumers can watch current and react
      }
    },

    onKeypointsComplete: () => {
      // keep minimal logic here
      if (activeTool.value === 'Keypoint') {
        // switch to select if appropriate
        activeTool.value = 'Select';
      }
    },
  };

  const refsForTemplateProxy = {
    categories,
    dataset,
    loading,
    panels,
    mode: ref('segment'),
    current,
    hover,
    annotating,
    search,
    shapeOpacity,
    activeTool,
    simplify,
    cursor,
    categorylist: refsForTemplate.categorylist,
    settings: refsForTemplate.settings,
    toolspanel: refsForTemplate.toolspanel,
    refcanvas: refsForTemplate.refcanvas,
    filetitle: refsForTemplate.filetitle,
    zoom: refsForTemplate.zoom,
  };

  // safe computed helpers that guard against nulls
  const user = computed(() => authStore.user);

  return {
    state: { image, categories, dataset, loading, panels, current, hover, annotating, procStore },
    refsForTemplate: refsForTemplateProxy,
    helpers,
    procStore,
    user,
  };
}
