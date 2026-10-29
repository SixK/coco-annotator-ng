import { ref, computed, reactive, watch } from 'vue';
import { useAuthStore } from '@/store/user';

const SIMPLIFY_KEY = 'annotator/simplify';

const readSimplify = () => {
  try {
    const raw = localStorage.getItem(SIMPLIFY_KEY);
    if (raw === null || raw.trim() === '') return 1;
    const value = Number(raw);
    return Number.isFinite(value) ? value : 1;
  } catch {
    return 1;
  }
};

const persistSimplify = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return;
  try {
    localStorage.setItem(SIMPLIFY_KEY, String(value));
  } catch {
  }
};

export default function useAnnotatorState(image) {
  // stores
  const authStore = useAuthStore();

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
  const simplify = ref(readSimplify());
  watch(simplify, persistSimplify);
  const cursor = ref('move');

  // zoom is the only ref owned here; every template ref is declared in
  // Annotator.vue with useTemplateRef() so the binding key is verified.
  const refsForTemplate = {
    zoom: ref(0.2),
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
    }
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
    simplify,
    cursor,
    zoom: refsForTemplate.zoom,
  };

  // safe computed helpers that guard against nulls
  const user = computed(() => authStore.user);

  return {
    state: { image, categories, dataset, loading, panels, current, hover, annotating },
    refsForTemplate: refsForTemplateProxy,
    helpers,
    user,
  };
}
