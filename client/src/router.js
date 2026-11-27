import { createWebHistory, createRouter } from "vue-router";
import { watch } from "vue";
import PageNotFound from "@/views/PageNotFound";
import { useAuthStore } from "@/store/user";

const routes = [
  {
    path: "/about",
    name: "about",
    component: () => import("@/views/About"),
  },
  {
    alias: "/",
    path: "/datasets",
    name: "datasets",
    component: () => import("@/views/Datasets"),
    meta: { requiresAuth: true },
  },
  {
    path: "/categories",
    name: "categories",
    component: () => import("@/views/Categories"),
    meta: { requiresAuth: true },
  },
  {
    path: "/undo",
    name: "undo",
    component: () => import("@/views/Undo"),
    meta: { requiresAuth: true },
  },
  {
    path: "/annotate/:identifier",
    name: "annotate",
    component: () => import("@/views/Annotator"),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/dataset/:identifier",
    name: "dataset",
    component: () => import("@/views/Dataset"),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/auth",
    name: "authentication",
    component: () => import("@/views/Auth"),
    props: true,
  },
  {
    path: "/user",
    name: "user",
    component: () => import("@/views/User"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/panel",
    name: "admin",
    component: () => import("@/views/AdminPanel"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/tasks",
    name: "tasks",
    component: () => import("@/views/Tasks"),
    meta: { requiresAuth: true },
  },
  { path: "/:pathMatch(.*)*", name: "notfound", component: PageNotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global navigation guard: protect authenticated-only routes. The admin
// panel additionally requires the `isAdmin` flag of the auth store.
router.beforeEach(async (to) => {
  const requiresAuth = to.meta.requiresAuth === true;
  const requiresAdmin = to.meta.requiresAdmin === true;

  const auth = useAuthStore();

  if (!requiresAuth && !requiresAdmin) {
    return true;
  }

  // Wait for the ongoing auth check to settle before deciding.
  if (auth.isAuthenticatePending) {
    await new Promise((resolve) => {
      const unwatch = watch(
        () => auth.isAuthenticatePending,
        (pending) => {
          if (!pending) {
            unwatch();
            resolve();
          }
        }
      );
    });
  }

  if (!auth.isAuthenticated) {
    return { name: "authentication" };
  }

  if (requiresAdmin && !auth.isAdmin) {
    return { name: "datasets" };
  }

  return true;
});

export default router;
