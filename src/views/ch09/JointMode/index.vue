<script setup lang="ts">
import { onMounted } from 'vue'
import { Matrix4 } from '@/lib/cuon-matrix'
import { shaderProgramUtils } from '@/utils/shader-program-utils'
// @ts-expect-error 忽略类型错误
import FSHADER_SOURCE from './f-shader.glsl'
// @ts-expect-error 忽略类型错误
import VSHADER_SOURCE from './v-shader.glsl'

const { initShaders, initWebglContext } = shaderProgramUtils

// 全局变量
const ANGLE_STEP = 3.0
let g_arm1Angle = -90.0 // arm1 绕y轴旋转
let g_joint1Angle = 0.0 // arm2 绕z轴旋转

// 矩阵
const g_modelMatrix = new Matrix4()
const g_mvpMatrix = new Matrix4()
const g_normalMatrix = new Matrix4()

onMounted(() => {
  main()
  document.addEventListener('keydown', keydown)
})

function main() {
  const canvas = document.getElementById('webgl') as HTMLCanvasElement
  if (!canvas) {
    console.error('未找到 canvas 元素')
    return
  }
  const gl = initWebglContext()
  if (!gl) {
    console.error('Failed to initialize WebGL context')
    return
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.error('Failed to initialize shaders.')
    return
  }
  const n = initVertexBuffers(gl)
  if (n < 0) {
    console.error('Failed to set the positions of the vertices')
    return
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.enable(gl.DEPTH_TEST)

  // 获取 uniform 变量
  const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
  const u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix')
  if (!u_MvpMatrix || !u_NormalMatrix) {
    console.error('Failed to get the storage location of some uniforms')
    return
  }

  // 视图投影矩阵
  const viewProjMatrix = new Matrix4()
  viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0)
  viewProjMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)

  draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix)
}

function keydown(ev: KeyboardEvent) {
  const canvas = document.getElementById('webgl') as HTMLCanvasElement
  const gl = initWebglContext()
  if (!canvas || !gl)
    return
  const n = 36 // 机械臂顶点数
  const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
  const u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix')
  const viewProjMatrix = new Matrix4()
  viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0)
  viewProjMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)

  switch (ev.key) {
    case 'ArrowUp':
      if (g_joint1Angle < 135.0)
        g_joint1Angle += ANGLE_STEP
      break
    case 'ArrowDown':
      if (g_joint1Angle > -135.0)
        g_joint1Angle -= ANGLE_STEP
      break
    case 'ArrowRight':
      g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360
      break
    case 'ArrowLeft':
      g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360
      break
    default:
      return
  }
  draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix)
}

function initVertexBuffers(gl: WebGLRenderingContext) {
  // 长方体顶点
  const vertices = new Float32Array([
    1.5,
    10.0,
    1.5,
    -1.5,
    10.0,
    1.5,
    -1.5,
    0.0,
    1.5,
    1.5,
    0.0,
    1.5, // v0-v1-v2-v3 front
    1.5,
    10.0,
    1.5,
    1.5,
    0.0,
    1.5,
    1.5,
    0.0,
    -1.5,
    1.5,
    10.0,
    -1.5, // v0-v3-v4-v5 right
    1.5,
    10.0,
    1.5,
    1.5,
    10.0,
    -1.5,
    -1.5,
    10.0,
    -1.5,
    -1.5,
    10.0,
    1.5, // v0-v5-v6-v1 up
    -1.5,
    10.0,
    1.5,
    -1.5,
    10.0,
    -1.5,
    -1.5,
    0.0,
    -1.5,
    -1.5,
    0.0,
    1.5, // v1-v6-v7-v2 left
    -1.5,
    0.0,
    -1.5,
    1.5,
    0.0,
    -1.5,
    1.5,
    0.0,
    1.5,
    -1.5,
    0.0,
    1.5, // v7-v4-v3-v2 down
    1.5,
    0.0,
    -1.5,
    -1.5,
    0.0,
    -1.5,
    -1.5,
    10.0,
    -1.5,
    1.5,
    10.0,
    -1.5, // v4-v7-v6-v5 back
  ])
  // 法线
  const normals = new Float32Array([
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0, // v0-v1-v2-v3 front
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0, // v0-v3-v4-v5 right
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    0.0, // v0-v5-v6-v1 up
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0, // v1-v6-v7-v2 left
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0, // v7-v4-v3-v2 down
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0,
    0.0,
    0.0,
    -1.0, // v4-v7-v6-v5 back
  ])
  // 索引
  const indices = new Uint8Array([
    0,
    1,
    2,
    0,
    2,
    3, // front
    4,
    5,
    6,
    4,
    6,
    7, // right
    8,
    9,
    10,
    8,
    10,
    11, // up
    12,
    13,
    14,
    12,
    14,
    15, // left
    16,
    17,
    18,
    16,
    18,
    19, // down
    20,
    21,
    22,
    20,
    22,
    23, // back
  ])
  if (!initArrayBuffer(gl, 'a_Position', vertices, gl.FLOAT, 3))
    return -1
  if (!initArrayBuffer(gl, 'a_Normal', normals, gl.FLOAT, 3))
    return -1
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  const indexBuffer = gl.createBuffer()
  if (!indexBuffer) {
    console.warn('Failed to create the buffer object')
    return -1
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
  return indices.length
}

function draw(
  gl: WebGLRenderingContext,
  n: number,
  viewProjMatrix: Matrix4,
  u_MvpMatrix: WebGLUniformLocation,
  u_NormalMatrix: WebGLUniformLocation,
) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  // arm1
  const arm1Length = 10.0
  g_modelMatrix.setTranslate(0.0, -12.0, 0.0)
  g_modelMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0)
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix)
  // arm2
  g_modelMatrix.translate(0.0, arm1Length, 0.0)
  g_modelMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0)
  g_modelMatrix.scale(1.3, 1.0, 1.3)
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix)
}

function drawBox(
  gl: WebGLRenderingContext,
  n: number,
  viewProjMatrix: Matrix4,
  u_MvpMatrix: WebGLUniformLocation,
  u_NormalMatrix: WebGLUniformLocation,
) {
  g_mvpMatrix.set(viewProjMatrix)
  g_mvpMatrix.multiply(g_modelMatrix)
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements)
  g_normalMatrix.setInverseOf(g_modelMatrix)
  g_normalMatrix.transpose()
  gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements)
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
}

function initArrayBuffer(
  gl: WebGLRenderingContext,
  attribute: string,
  data: Float32Array,
  type: number,
  num: number,
) {
  // Create a buffer object
  const buffer = gl.createBuffer()
  if (!buffer) {
    console.warn('Failed to create the buffer object')
    return false
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  // Assign the buffer object to the attribute variable
  const a_attribute = gl.getAttribLocation(gl.program, attribute)
  if (a_attribute < 0) {
    console.warn(`Failed to get the storage location of ${attribute}`)
    return false
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0)
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  return true
}
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h2>单关节模型</h2>
      <p>
        通过键盘控制机械臂的旋转，其实就是定义好关节之间的控制关系来实现
      </p>
    </div>
    <div class="canvas-container">
      <canvas id="webgl" width="400" height="400" />
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 2rem;
}

.demo-header h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.demo-header p {
  color: #666;
  font-size: 1rem;
}

.canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 2rem;
}

canvas {
  border: 1px solid #ddd;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
