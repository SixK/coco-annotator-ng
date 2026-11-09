export function applyAnnotating(list, username, active) {
  if (!list) return;
  const index = list.indexOf(username);
  if (active) {
    if (index < 0) list.push(username);
  } else if (index > -1) {
    list.splice(index, 1);
  }
}

export function removeAnnotating(list, username) {
  if (!list || username == null) return;
  const index = list.indexOf(username);
  if (index > -1) list.splice(index, 1);
}

export function onAnnotatingForList(imagesRef, data) {
  const image = imagesRef.value.find((i) => i.id == data.image_id);
  if (image == null) return;
  applyAnnotating(image.annotating, data.username, data.active);
}

export function onAnnotatingForImage(imageIdRef, annotatingRef, data) {
  const imageId = imageIdRef.value?.id ?? imageIdRef.value;
  if (data.image_id !== imageId) return;
  applyAnnotating(annotatingRef.value, data.username, data.active);
}
