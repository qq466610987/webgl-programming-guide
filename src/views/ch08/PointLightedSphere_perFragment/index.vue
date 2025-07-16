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
  // 获取 uniform 变量
  const u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
  const u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
  const u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix')
  const u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor')
  const u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition')
  const u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight')
  if (!u_ModelMatrix || !u_mvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition || !u_AmbientLight) {
    console.error('Failed to get the storage location of some uniforms')
    return
  }
  // 设置光照
  gl.uniform3f(u_LightColor, 0.8, 0.8, 0.8)
  gl.uniform3f(u_LightPosition, 5.0, 8.0, 7.0)
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2)
  // 模型矩阵
  const modelMatrix = new Matrix4()
  modelMatrix.setRotate(90, 0, 1, 0)
  // mvp矩阵
  const mvpMatrix = new Matrix4()
  mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100)
  mvpMatrix.lookAt(0, 0, 6, 0, 0, 0, 0, 1, 0)
  mvpMatrix.multiply(modelMatrix)
  // 法线变换矩阵
  const normalMatrix = new Matrix4()
  normalMatrix.setInverseOf(modelMatrix)
  normalMatrix.transpose()
  // uniform 赋值
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
  gl.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements)
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements)
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0)
}

function initVertexBuffers(gl: WebGLRenderingContext) { // Create a sphere
  const SPHERE_DIV = 13

  let i, ai, si, ci
  let j, aj, sj, cj
  let p1, p2

  const positions = []
  const indices = []

  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV
    sj = Math.sin(aj)
    cj = Math.cos(aj)
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV
      si = Math.sin(ai)
      ci = Math.cos(ai)

      positions.push(si * sj) // X
      positions.push(cj) // Y
      positions.push(ci * sj) // Z
    }
  }

  // Generate indices
  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = j * (SPHERE_DIV + 1) + i
      p2 = p1 + (SPHERE_DIV + 1)

      indices.push(p1)
      indices.push(p2)
      indices.push(p1 + 1)

      indices.push(p1 + 1)
      indices.push(p2)
      indices.push(p2 + 1)
    }
  }

  // Write the vertex property to buffers (coordinates and normals)
  // Same data can be used for vertex and normal
  // In order to make it intelligible, another buffer is prepared separately
  if (!initArrayBuffer(gl, 'a_Position', new Float32Array(positions), gl.FLOAT, 3))
    return -1
  if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(positions), gl.FLOAT, 3))
    return -1

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  // Write the indices to the buffer object
  const indexBuffer = gl.createBuffer()
  if (!indexBuffer) {
    console.warn('Failed to create the buffer object')
    return -1
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

  return indices.length
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
      <h2>点光源照射下的球体(逐片元计算颜色)</h2>
      <p>
        逐片元的计算是通过将顶点着色器中顶点和法向量以varying变量的形式传入片元着色器，在片元着色器中计算颜色，这样片元着色器中就包含了顶点着色器中的所有计算
        <br>
        在片元着色器中计算颜色，这样片元着色器中的同名变量就已经是内插后的逐片元值了。
      </p>
      <p>跟前一个例子对比，可以观察到明暗分界更自然了</p>
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
