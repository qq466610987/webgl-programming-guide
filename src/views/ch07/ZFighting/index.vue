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
  const modelMatrix = new Matrix4()
  const viewMatrix = new Matrix4()
  const projectionMatrix = new Matrix4()
  const mvpMatrix = new Matrix4()
  viewMatrix.setLookAt(3.06, 2.5, 10.0, 0, 0, -2, 0, 1, 0)
  projectionMatrix.setPerspective(30, 1, 1, 100)
  mvpMatrix.set(projectionMatrix).multiply(viewMatrix).multiply(modelMatrix)
  gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements)
  // === 新增 ===
  //  绘制右侧的一组三角形
  // 开启深度测试
  gl.enable(gl.DEPTH_TEST)
  // 清楚颜色和深度缓冲区，以消除上一帧留下的痕迹
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  // 绘制三角形
  gl.drawArrays(gl.TRIANGLES, 0, n / 2) // The green triangle
  gl.polygonOffset(1.0, 1.0) // Set the polygon offset
  gl.drawArrays(gl.TRIANGLES, n / 2, n / 2) // The yellow triangle
}

function initVertexBuffers(gl: WebGLRenderingContext) {
  // 新增
  // 顶点坐标和颜色值
  const verticesColor = new Float32Array([
    0.0, 2.5, -5.0, 0.4, 1.0, 0.4, // The green triangle
    -2.5, -2.5, -5.0, 0.4, 1.0, 0.4,
    2.5, -2.5, -5.0, 1.0, 0.4, 0.4,

    0.0, 3.0, -5.0, 1.0, 0.4, 0.4, // The yellow triagle
    -3.0, -3.0, -5.0, 1.0, 1.0, 0.4,
    3.0, -3.0, -5.0, 1.0, 1.0, 0.4,
  ])
  // 每个三角形三个顶点，共6个顶点
  const n = 6

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
      <h2>使用多边形偏移解决深度冲突</h2>
      <p>webgl中两个三角形的Z值相同时，会出现深度冲突</p>
      <p>使用WebGl的多边形偏移机制，可以解决深度冲突</p>
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
