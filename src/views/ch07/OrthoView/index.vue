<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Matrix4 } from '@/lib/cuon-matrix'
import { shaderProgramUtils } from '@/utils/shader-program-utils'
// @ts-expect-error 忽略类型错误
import FSHADER_SOURCE from './f-shader.glsl'
// @ts-expect-error 忽略类型错误
import VSHADER_SOURCE from './v-shader.glsl'

const { initShaders, initWebglContext } = shaderProgramUtils

onMounted(() => {
  main()
})

function main() {
  const gl = initWebglContext()
  if (!gl) {
    console.error('Failed to initialize WebGL context')
    return
  }
  // 初始化着色器
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.error('Failed to initialize shaders.')
    return
  }
  // Write the positions of vertices to a vertex shader
  const n = initVertexBuffers(gl)
  if (n < 0) {
    console.error('Failed to set the positions of the vertices')
    return
  }
  // 设置视图矩阵
  const u_projectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix')
  if (!u_projectionMatrix) {
    console.error('Failed to get the storage location of u_ProjectionMatrix')
    return
  }
  const projectionMatrix = new Matrix4()
  document.onkeydown = (ev) => {
    keydown(ev, gl, n, u_projectionMatrix, projectionMatrix)
  }
  draw(gl, n, u_projectionMatrix, projectionMatrix)
}

function initVertexBuffers(gl: WebGLRenderingContext) {
  // 新增
  // 顶点坐标和颜色值
  const verticesColor = new Float32Array([
    // Vertex coordinates and color(RGBA)
    0.0, 0.5, -0.4, 0.4, 1.0, 0.4, // 后边的绿色三角形
    -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
    0.5, -0.5, -0.4, 1.0, 0.4, 0.4,

    0.5, 0.4, -0.2, 1.0, 0.4, 0.4, // 中间的黄色三角形
    -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
    0.0, -0.6, -0.2, 1.0, 1.0, 0.4,

    0.0, 0.5, 0.0, 0.4, 0.4, 1.0, // 前边的蓝色三角形
    -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
    0.5, -0.5, 0.0, 1.0, 0.4, 0.4,
  ])
  const n = 9

  const vertexColorBuffer = gl.createBuffer()
  if (!vertexColorBuffer) {
    console.warn('Failed to create the buffer object')
    return -1
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, verticesColor, gl.STATIC_DRAW)

  // 获取每个元素所占的字节数
  const FSIZE = verticesColor.BYTES_PER_ELEMENT
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  if (a_Position < 0) {
    console.warn('Failed to get the storage location of a_Position')
    return -1
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0)
  gl.enableVertexAttribArray(a_Position)

  // 分配a_Color
  const a_Color = gl.getAttribLocation(gl.program, 'a_Color')
  if (a_Color < 0) {
    console.warn('Failed to get the storage location of a_Color')
    return -1
  }
  // 此时 gl.ARRAY_BUFFER绑定的缓冲区是vertexColorBuffer
  // 告诉Webgl如何从缓冲区中读取数据，分配给a_color
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
  gl.enableVertexAttribArray(a_Color)

  return n
}
// 视点与近、远裁剪面的距离
const g_near = ref(0)
const g_far = ref(0.5)
function keydown(ev: KeyboardEvent, gl: WebGLRenderingContext, n: number, u_projectionMatrix: WebGLUniformLocation, viewMatrix: Matrix4) {
  switch (ev.keyCode) {
    case 39: g_near.value += 0.01; break
    case 37: g_near.value -= 0.01; break
    case 40: g_far.value += 0.01; break
    case 38: g_far.value -= 0.01; break
    default: return
  }
  draw(gl, n, u_projectionMatrix, viewMatrix)
}

function draw(gl: WebGLRenderingContext, n: number, u_projectionMatrix: WebGLUniformLocation, projectionMatrix: Matrix4) {
  projectionMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, g_near.value, g_far.value)
  gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements)
  // gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, n)
}
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h2>正射投影</h2>
      <p>使用方向键控制近远裁剪平面的距离</p>
      <p>近裁剪面距离：{{ g_near.toFixed(2) }}</p>
      <p>远裁剪面距离：{{ g_far.toFixed(2) }}</p>
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
