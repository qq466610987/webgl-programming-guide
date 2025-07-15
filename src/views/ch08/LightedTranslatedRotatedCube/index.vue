<script setup lang="ts">
import { onMounted } from 'vue'
import { Matrix4, Vector3 } from '@/lib/cuon-matrix'
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
  // ✅新增：设置模型矩阵，用于对立方体进行变换
  const modelMatrix = new Matrix4()
  // 先沿着Y轴平移1个单位
  modelMatrix.setTranslate(0, 1, 0)
  // 再绕X轴旋转45度
  modelMatrix.setRotate(45, 1, 0, 0)
  // 设置mvp矩阵
  const u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_mvpMatrix')
  if (!u_mvpMatrix) {
    console.error('Failed to get the storage location of u_mvpMatrix')
    return
  }
  const mvpMatrix = new Matrix4()
  mvpMatrix.setPerspective(30, 1, 1, 100)
  mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0)
  // ✅新增：将模型矩阵与mvp矩阵相乘
  mvpMatrix.multiply(modelMatrix)
  gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements)
  // 设置光线颜色、方向、法向量
  const u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor')
  const u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection')
  // 设置白光
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0)
  // 设置光线坐标（世界坐标下）
  const lightDirection = new Vector3([0.5, 3.0, 4.0])
  lightDirection.normalize()
  gl.uniform3fv(u_LightDirection, lightDirection.elements)
  // 设置环境光
  const u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight')
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2)

  // ✅新增：设置用来变换法向量的矩阵
  const u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix')
  const normalMatrix = new Matrix4()
  // 根据模型矩阵，计算变换法向量的矩阵
  normalMatrix.setInverseOf(modelMatrix)
  normalMatrix.transpose()
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements)

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // Draw the cube
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
}

function initVertexBuffers(gl: WebGLRenderingContext) {
  const vertices = new Float32Array([ // Vertex coordinates
    1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, // v0-v1-v2-v3 front
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, // v0-v3-v4-v5 right
    1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, // v1-v6-v7-v2 left
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // v7-v4-v3-v2 down
    1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, // v4-v7-v6-v5 back
  ])

  const colors = new Float32Array([ // Colors
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v0-v1-v2-v3 front
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v0-v3-v4-v5 right
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v0-v5-v6-v1 up
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v1-v6-v7-v2 left
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v7-v4-v3-v2 down
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v4-v7-v6-v5 back
  ])

  const indices = new Uint8Array([ // Indices of the vertices
    0, 1, 2, 0, 2, 3, // front
    4, 5, 6, 4, 6, 7, // right
    8, 9, 10, 8, 10, 11, // up
    12, 13, 14, 12, 14, 15, // left
    16, 17, 18, 16, 18, 19, // down
    20, 21, 22, 20, 22, 23, // back
  ])
  // 每一个顶点的法向量
  const normals = new Float32Array([
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // v0-v1-v2-v3 front
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // v0-v3-v4-v5 right
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, // v4-v7-v6-v5 back
  ])

  // Create a buffer object
  const indexBuffer = gl.createBuffer()
  if (!indexBuffer)
    return -1
  // Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT))
    return -1
  if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT))
    return -1
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT))
    return -1

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

  return indices.length
}

function initArrayBuffer(
  gl: WebGLRenderingContext,
  attribute: string,
  data: Float32Array,
  num: number,
  type: number,
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
      <h2>运动物体的光照效果</h2>
      <p>计算一个进行平移、旋转后的立方体，在光照下的效果</p>
      <p>👉主要学习如何计算运动后物体的法向量</p>
      <p><strong>规则:</strong>用法向量乘以模型矩阵的逆转置矩阵。就可以求得变换后的法向量。</p>
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
