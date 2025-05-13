import { createRouter, createWebHashHistory } from "vue-router";
import Home from "@/views/Home.vue";
import test from "@/views/test.vue";

const routes = [
  { path: "/", component: Home }, // Home 页面
  { path: "/test", component: test }, // test页面
  {
    path: "/product-selection",
    component: () => import("@/views/ProductSelection.vue"),
  }, // 产品选择页面
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
