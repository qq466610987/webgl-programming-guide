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
  // 第三章 - 绘制一个三角形
  {
    path: '/ch03/TranslatedTriangle',
    component: () => import('@/views/ch03/TranslatedTriangle/index.vue'),
    meta: { description: '平移三角形' },
  },
  {
    path: '/ch03/RotatedTriangle',
    component: () => import('@/views/ch03/RotatedTriangle/index.vue'),
    meta: { description: '旋转三角形' },
  },
  {
    path: '/ch03/RotatedTriangle_Matrix',
    component: () => import('@/views/ch03/RotatedTriangle_Matrix/index.vue'),
    meta: { description: '旋转三角形（矩阵）' },
  },
  {
    path: '/ch03/ScaledTriangle_Matrix',
    component: () => import('@/views/ch03/ScaledTriangle_Matrix/index.vue'),
    meta: { description: '缩放三角形（矩阵）' },
  },
  {
    path: '/ch04/RotatedTranslatedTriangle',
    component: () => import('@/views/ch04/RotatedTranslatedTriangle/index.vue'),
    meta: { description: '组合变换（旋转并平移）' },
  },
  {
    path: '/ch04/RotatingTriangle',
    component: () => import('@/views/ch04/RotatingTriangle/index.vue'),
    meta: { description: '旋转三角形动画' },
  },
  {
    path: '/ch05/MultiAttributeSize',
    component: () => import('@/views/ch05/MultiAttributeSize/index.vue'),
    meta: { description: '使用多缓冲区绘制多个点' },
  },
  {
    path: '/ch05/MultiAttributeSize_Interleaved',
    component: () => import('@/views/ch05/MultiAttributeSize_Interleaved/index.vue'),
    meta: { description: '使用一个缓冲区交错存储顶点和尺寸数据' },
  },
  {
    path: '/ch05/MultiAttributeColor',
    component: () => import('@/views/ch05/MultiAttributeColor/index.vue'),
    meta: { description: '通过varing变量在顶点着色器和片段着色器间传值' },
  },
  {
    path: '/ch05/ColoredTriangle',
    component: () => import('@/views/ch05/ColoredTriangle/index.vue'),
    meta: { description: '使用多缓冲区绘制三角形' },
  },
  {
    path: '/ch05/HelloTriangle_FragCoord',
    component: () => import('@/views/ch05/HelloTriangle_FragCoord/index.vue'),
    meta: { description: '绘制跟随位置变换颜色的渐变三角形' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
