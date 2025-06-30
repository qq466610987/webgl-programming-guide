import { createRouter, createWebHistory } from 'vue-router'

export const routes = [
  {
    path: '/',
    component: () => import('@/views/Home/index.vue'),
    meta: { title: '首页' },
  },
  // 第二章 - WebGL入门
  {
    path: '/ch02/HelloCanvas',
    component: () => import('@/views/ch02/HelloCanvas/index.vue'),
    meta: { description: '清空绘图区域' },
  },
  {
    path: '/ch02/HelloPoint1',
    component: () => import('@/views/ch02/HelloPoint1/index.vue'),
    meta: { description: '绘制一个点' },
  },
  {
    path: '/ch02/ClickedPoints',
    component: () => import('@/views/ch02/ClickedPoints/index.vue'),
    meta: { description: '鼠标点击绘制点' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
