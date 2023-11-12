// import { Vue } from "vue";
import { createWebHistory, createRouter } from "vue-router";

// import Home from "@/views/Home";
import About from "@/views/About";
import Annotator from "@/views/Annotator";
import AdminPanel from "@/views/AdminPanel";
import Datasets from "@/views/Datasets";
import Categories from "@/views/Categories";
import Undo from "@/views/Undo";
import Dataset from "@/views/Dataset";
import Authentication from "@/views/Auth";
import User from "@/views/User";
import Tasks from "@/views/Tasks";
import PageNotFound from "@/views/PageNotFound";

const routes = [
  {
    path: "/about",
    name: "about",
    component: About,
  },
  {
    alias: "/",
    path: "/datasets",
    name: "datasets",
    component: Datasets,
  },
  {
    path: "/categories",
    name: "categories",
    component: Categories,
  },
  {
    path: "/undo",
    name: "undo",
    component: Undo,
  },
  {
    path: "/annotate/:identifier",
    name: "annotate",
    component: Annotator,
    props: true,
  },
  {
    path: "/dataset/:identifier",
    name: "dataset",
    component: Dataset,
    props: true,
  },
  {
    path: "/auth",
    name: "authentication",
    component: Authentication,
    props: true,
  },
  {
    path: "/user",
    name: "user",
    component: User,
  },
  {
    path: "/admin/panel",
    name: "admin",
    component: AdminPanel,
  },
  {
    path: "/tasks",
    name: "tasks",
    component: Tasks,
  },
  { path: "/:pathMatch(.*)*", name: "notfound", component: PageNotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
