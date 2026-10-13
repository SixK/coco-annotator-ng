import { createWebHistory, createRouter } from "vue-router";
import PageNotFound from "@/views/PageNotFound";

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
  },
  {
    path: "/categories",
    name: "categories",
    component: () => import("@/views/Categories"),
  },
  {
    path: "/undo",
    name: "undo",
    component: () => import("@/views/Undo"),
  },
  {
    path: "/annotate/:identifier",
    name: "annotate",
    component: () => import("@/views/Annotator"),
    props: true,
  },
  {
    path: "/dataset/:identifier",
    name: "dataset",
    component: () => import("@/views/Dataset"),
    props: true,
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
  },
  {
    path: "/admin/panel",
    name: "admin",
    component: () => import("@/views/AdminPanel"),
  },
  {
    path: "/tasks",
    name: "tasks",
    component: () => import("@/views/Tasks"),
  },
  { path: "/:pathMatch(.*)*", name: "notfound", component: PageNotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
