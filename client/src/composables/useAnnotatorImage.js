import { ref } from 'vue';

export default function useAnnotatorImage(filetitle) {

  // reactive state (moved from large SFC)
  const image = ref({
    raster: {},
    scale: 0,
    metadata: {},
    ratio: 0,
    rotate: 0,
    id: null,
    url: '',
    dataset: 0,
    previous: null,
    next: null,
    filename: '',
    categoryIds: [],
    data: null,
  });

  const getImageId = () => {
      return image.value.id;
  };

  const nextImage = () => {
    if (image.value.next != null) filetitle.value.route(image.value.next);
  }

  const previousImage = () => {
    if (image.value.previous != null) filetitle.value.route(image.value.previous);
  }

return { image, getImageId, nextImage,  previousImage};
}
