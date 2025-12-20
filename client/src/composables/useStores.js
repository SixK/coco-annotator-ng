import { useInfoStore } from "@/store/info";
import { useAuthStore } from "@/store/user";
import { useProcStore } from "@/store/index";

export function useStores() {
  return {
    auth: useAuthStore(),
    proc: useProcStore(),
    info: useInfoStore()
  };
}
