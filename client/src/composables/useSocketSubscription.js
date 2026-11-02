import { getCurrentInstance, onMounted, onUnmounted } from "vue";

/**
 * Subscribes to a socket.io event for the lifetime of the calling component
 * and unsubscribes it on unmount. Replaces the five copies of
 *
 *   getCurrentInstance().ctx.sockets.subscribe(evt, handler);   // in onMounted
 *   getCurrentInstance().ctx.sockets.unsubscribe(evt);          // in onUnmounted
 *
 * spread over Dataset.vue, Annotator.vue, Category.vue, Annotation.vue and
 * Task.vue.
 *
 * Must be called during setup(), NOT inside `onMounted`: vue-3-socket.io-ext
 * attaches `this.sockets` in a `beforeCreate` mixin, and Vue runs `beforeCreate`
 * after `setup()` (finishComponentSetup -> applyOptions), so the subscription
 * itself is deferred to `mounted` — exactly when the five call sites did it.
 * Subscribing earlier would throw on an undefined `sockets`.
 *
 * The library unsubscribes per component (removeListener filters on the
 * component), so two components listening to the same event ('annotation',
 * 'taskProgress', 'annotating') do not clobber each other. Note that only the
 * declarative `$options.sockets` API is cleaned up automatically by the plugin:
 * a manual `subscribe()` MUST be paired with an `unsubscribe()`, which is what
 * the onUnmounted hook below guarantees.
 *
 * @param {string} event socket.io event name
 * @param {(...args: any[]) => void} handler called with the event payload
 */
export default function useSocketSubscription(event, handler) {
  const instance = getCurrentInstance();

  onMounted(() => {
    instance.ctx.sockets.subscribe(event, handler);
  });

  onUnmounted(() => {
    instance.ctx.sockets.unsubscribe(event);
  });
}
