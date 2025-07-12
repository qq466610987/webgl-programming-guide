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
  // 设置视图矩阵
  const u_viewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix')
  if (!u_viewMatrix) {
    console.error('Failed to get the storage location of u_ViewMatrix')
    return
  }
  // 设置视图矩阵
  const viewMatrix = new Matrix4()
  viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0)
  gl.uniformMatrix4fv(u_viewMatrix, false, viewMatrix.elements)

  // 设置投影矩阵
  const u_projectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix')
  const projectionMatrix = new Matrix4()
  projectionMatrix.setPerspective(30, 1, 1, 100)
  gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements)

  gl.drawArrays(gl.TRIANGLES, 0, n)
}

function initVertexBuffers(gl: WebGLRenderingContext) {
  // 新增
  // 顶点坐标和颜色值
  const verticesColor = new Float32Array([
    // 右侧的三个三角形
    // 后边的绿色
    0.75, 1.0, -4.0, 0.4, 1.0, 0.4,
    0.25, -1.0, -4.0, 0.4, 1.0, 0.4,
    1.25, -1.0, -4.0, 1.0, 0.4, 0.4,
    //  中间黄色
    0.75, 1.0, -2.0, 1.0, 1.0, 0.4,
    0.25, -1.0, -2.0, 1.0, 1.0, 0.4,
    1.25, -1.0, -2.0, 1.0, 0.4, 0.4,
    // 前边的蓝色
    0.75, 1.0, 0.0, 0.4, 0.4, 1.0,
    0.25, -1.0, 0.0, 0.4, 0.4, 1.0,
    1.25, -1.0, 0.0, 1.0, 0.4, 0.4,

    // Three triangles on the left side
    -0.75, 1.0, -4.0, 0.4, 1.0, 0.4, // The back green one
    -1.25, -1.0, -4.0, 0.4, 1.0, 0.4,
    -0.25, -1.0, -4.0, 1.0, 0.4, 0.4,

    -0.75, 1.0, -2.0, 1.0, 1.0, 0.4, // The middle yellow one
    -1.25, -1.0, -2.0, 1.0, 1.0, 0.4,
    -0.25, -1.0, -2.0, 1.0, 0.4, 0.4,

    -0.75, 1.0, 0.0, 0.4, 0.4, 1.0, // The front blue one
    -1.25, -1.0, 0.0, 0.4, 0.4, 1.0,
    -0.25, -1.0, 0.0, 1.0, 0.4, 0.4,
  ])
  // 每个三角形三个顶点，共6个顶点
  const n = 18

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
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h2>透视投影</h2>
      <p>使用透视投影，观察三维空间中的三角形</p>
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
