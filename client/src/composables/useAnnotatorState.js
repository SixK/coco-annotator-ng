import { ref, computed, reactive } from 'vue';
import { useAuthStore } from '@/store/user';

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
  const simplify = ref(1);
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
