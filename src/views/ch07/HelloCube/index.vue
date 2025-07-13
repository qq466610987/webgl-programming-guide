<script setup lang="ts">
import { onMounted } from 'vue'
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
  // 设置mvp矩阵
  const u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_mvpMatrix')
  if (!u_mvpMatrix) {
    console.error('Failed to get the storage location of u_mvpMatrix')
    return
  }
  const mvpMatrix = new Matrix4()
  mvpMatrix.setPerspective(30, 1, 1, 100)
  mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0)
  gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements)
  // === 新增 ===
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT)

  // Draw the cube
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
}

function initVertexBuffers(gl: WebGLRenderingContext) {
  const verticesColor = new Float32Array([
    1.0, 1.0, 1.0, 1.0, 1.0, 1.0, // v0 White
    -1.0, 1.0, 1.0, 1.0, 0.0, 1.0, // v1 Magenta
    -1.0, -1.0, 1.0, 1.0, 0.0, 0.0, // v2 Red
    1.0, -1.0, 1.0, 1.0, 1.0, 0.0, // v3 Yellow
    1.0, -1.0, -1.0, 0.0, 1.0, 0.0, // v4 Green
    1.0, 1.0, -1.0, 0.0, 1.0, 1.0, // v5 Cyan
    -1.0, 1.0, -1.0, 0.0, 0.0, 1.0, // v6 Blue
    -1.0, -1.0, -1.0, 0.0, 0.0, 0.0, // v7 Black
  ])
  // 每个三角形三个顶点，共6个顶点
  // Indices of the vertices
  const indices = new Uint8Array([
    0, 1, 2, 0, 2, 3, // front
    0, 3, 4, 0, 4, 5, // right
    0, 5, 6, 0, 6, 1, // up
    1, 6, 7, 1, 7, 2, // left
    7, 4, 3, 7, 3, 2, // down
    4, 7, 6, 4, 6, 5, // back
  ])

  const vertexColorBuffer = gl.createBuffer()

  if (!vertexColorBuffer) {
    console.warn('Failed to create the buffer object')
    return -1
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, verticesColor, gl.STATIC_DRAW)

  // 获取每个元素所占的字节数
  const FSIZE = verticesColor.BYTES_PER_ELEMENT
  // 分配a_Position
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0)
  gl.enableVertexAttribArray(a_Position)

  // 分配a_Color
  const a_Color = gl.getAttribLocation(gl.program, 'a_Color')
  // 告诉Webgl如何从缓冲区中读取数据，分配给a_color
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
  gl.enableVertexAttribArray(a_Color)

  // 绑定顶点索引缓冲
  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

  return indices.length
}
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h2>绘制一个立方体</h2>
      <p>使用顶点索引绘制立方体</p>
      <p>gl.drawElements</p>
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
