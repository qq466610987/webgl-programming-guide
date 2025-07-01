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
  // 新增： 组合变换
  const modelMatrix = new Matrix4()
  const angle = 60.0
  const tx = 0.5
  modelMatrix.setRotate(angle, 0, 0, 1) // 沿着Z轴旋转，计算旋转矩阵
  modelMatrix.translate(tx, 0, 0) // 平移，将模型矩阵乘以平移矩阵

  const u_modelMatrix = gl.getUniformLocation(gl.program, 'u_modelMatrix')
  gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.elements)
  // 指定清空<canvas>的颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  // 清空<canvas>
  gl.clear(gl.COLOR_BUFFER_BIT)
  // 绘制一个点
  gl.drawArrays(gl.TRIANGLES, 0, n)
}

function initVertexBuffers(gl: WebGLRenderingContext) {
  const vertices = new Float32Array([
    0,
    0.5,
    -0.5,
    -0.5,
    0.5,
    -0.5,
  ])
  const n = 3

  // 1. 创建缓冲区对象
  const vertexBuffer = gl.createBuffer()
  if (!vertexBuffer) {
    console.warn('Failed to create the buffer object')
    return -1
  }

  // 2. 将缓冲区对象绑定到目标
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  // 3. 向缓冲区对象中写入数据
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  // 4. 将缓冲区对象分配给a_Position变量
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  if (a_Position < 0) {
    console.warn('Failed to get the storage location of a_Position')
    return -1
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)

  // 5. 开启a_Position变量
  gl.enableVertexAttribArray(a_Position)

  return n
}
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h2>组合变换（旋转并平移）</h2>
      <p>使用矩阵库计算变换矩阵</p>
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
