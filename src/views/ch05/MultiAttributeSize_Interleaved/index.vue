<script setup lang="ts">
import { onMounted } from 'vue'
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
  // 指定清空<canvas>的颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  // 清空<canvas>
  gl.clear(gl.COLOR_BUFFER_BIT)
  // 绘制一个点
  gl.drawArrays(gl.POINTS, 0, n)
}

function initVertexBuffers(gl: WebGLRenderingContext) {
  // 新增
  const verticesSize = new Float32Array([
    0.0, 0.5, 10.0, // 第一个点的X/Y/尺寸
    -0.5, -0.5, 20.0, // 第二个点的X/Y/尺寸
    0.5, -0.5, 30.0, // 第三个点的X/Y/尺寸
  ])
  const n = 3

  const vertexSizeBuffer = gl.createBuffer()
  if (!vertexSizeBuffer) {
    console.warn('Failed to create the buffer object')
    return -1
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, verticesSize, gl.STATIC_DRAW)

  // 新增： 获取每个元素所占的字节数
  const FSIZE = verticesSize.BYTES_PER_ELEMENT
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  if (a_Position < 0) {
    console.warn('Failed to get the storage location of a_Position')
    return -1
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 3, 0)
  gl.enableVertexAttribArray(a_Position)
  // 分配a_PointSize
  const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize')
  if (a_PointSize < 0) {
    console.warn('Failed to get the storage location of a_PointSize')
    return -1
  }
  // 此时 gl.ARRAY_BUFFER绑定的缓冲区是vertexSizeBuffer
  gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 3, FSIZE * 2)
  gl.enableVertexAttribArray(a_PointSize)

  return n
}
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h2>使用一个缓冲区交错存储顶点和尺寸数据</h2>
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
