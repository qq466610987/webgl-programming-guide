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
  {
    path: '/ch05/TexturedQuad',
    component: () => import('@/views/ch05/TexturedQuad/index.vue'),
    meta: { description: '将一张纹理图片贴在矩形上' },
  },
  {
    path: '/ch05/TexturedQuad_Repeat',
    component: () => import('@/views/ch05/TexturedQuad_Repeat/index.vue'),
    meta: { description: '重复纹理' },
  },
  {
    path: '/ch05/TexturedQuad_Clamp_Mirror',
    component: () => import('@/views/ch05/TexturedQuad_Clamp_Mirror/index.vue'),
    meta: { description: '使用CLAMP_TO_EDGE和MIRRORED_REPEAT填充纹理边缘' },
  },
  {
    path: '/ch05/MultiTexture',
    component: () => import('@/views/ch05/MultiTexture/index.vue'),
    meta: { description: '使用多纹理' },
  },
  // 第七章 - 进入三维世界
  {
    path: '/ch07/LookAtTriangles',
    component: () => import('@/views/ch07/LookAtTriangles/index.vue'),
    meta: { description: '三维空间中绘制具有遮挡关系的三个三角形' },
  },
  {
    path: '/ch07/LookAtRotatedTriangles',
    component: () => import('@/views/ch07/LookAtRotatedTriangles/index.vue'),
    meta: { description: '从指定视点观察旋转后的三角形' },
  },
  {
    path: '/ch07/LookAtTrianglesWithKeys',
    component: () => import('@/views/ch07/LookAtTrianglesWithKeys/index.vue'),
    meta: { description: '使用键盘控制视点' },
  },
  {
    path: '/ch07/OrthoView',
    component: () => import('@/views/ch07/OrthoView/index.vue'),
    meta: { description: '正射投影' },
  },
  {
    path: '/ch07/LookAtTrianglesWithKeys_ViewVolume',
    component: () => import('@/views/ch07/LookAtTrianglesWithKeys_ViewVolume/index.vue'),
    meta: { description: '使用键盘控制视点(并修改可视空间,修复三角形的一个角被切掉的错误)' },
  },
  {
    path: '/ch07/PerspectiveView',
    component: () => import('@/views/ch07/PerspectiveView/index.vue'),
    meta: { description: '透视投影' },
  },
  {
    path: '/ch07/PerspectiveView_mvp',
    component: () => import('@/views/ch07/PerspectiveView_mvp/index.vue'),
    meta: { description: '透视投影(MVP)' },
  },
  {
    path: '/ch07/DepthBuffer',
    component: () => import('@/views/ch07/DepthBuffer/index.vue'),
    meta: { description: '深度缓冲' },
  },
  {
    path: '/ch07/ZFighting',
    component: () => import('@/views/ch07/ZFighting/index.vue'),
    meta: { description: '使用多边形偏移解决深度冲突' },
  },
  {
    path: '/ch07/HelloCube',
    component: () => import('@/views/ch07/HelloCube/index.vue'),
    meta: { description: '绘制一个立方体' },
  },
  {
    path: '/ch07/ColoredCube',
    component: () => import('@/views/ch07/ColoredCube/index.vue'),
    meta: { description: '绘制一个立方体,并给每个面着色' },
  },
  {
    path: '/ch08/LightedCube',
    component: () => import('@/views/ch08/LightedCube/index.vue'),
    meta: { description: '白色平行光照射下的红色立方体' },
  },
  {
    path: '/ch08/LightedCube_ambient',
    component: () => import('@/views/ch08/LightedCube_ambient/index.vue'),
    meta: { description: '白色平行光照射下的红色立方体，并添加环境光' },
  },
  {
    path: '/ch08/LightedTranslatedRotatedCube',
    component: () => import('@/views/ch08/LightedTranslatedRotatedCube/index.vue'),
    meta: { description: '运动物体的光照效果' },
  },
  {
    path: '/ch08/PointLightedCube',
    component: () => import('@/views/ch08/PointLightedCube/index.vue'),
    meta: { description: '点光源照射下的立方体' },
  },
  {
    path: '/ch08/PointLightedSphere',
    component: () => import('@/views/ch08/PointLightedSphere/index.vue'),
    meta: { description: '点光源照射下的球体' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
