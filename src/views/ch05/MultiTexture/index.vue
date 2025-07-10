<script setup lang="ts">
import { onMounted } from 'vue'
import circle from '@/assets/circle.gif'
import sky from '@/assets/sky.jpg'
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
  if (!initTextures(gl, n)) {
    console.error('Failed to initialize the texture.')
    return
  }
  // 指定清空<canvas>的颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  // 清空<canvas>
  gl.clear(gl.COLOR_BUFFER_BIT)
  // 绘制一个点
  gl.drawArrays(gl.TRIANGLES, 0, n)
}

function initVertexBuffers(gl: WebGLRenderingContext) {
  const verticesTexCoords = new Float32Array([
    -0.5, 0.5, 0.0, 1.0,
    -0.5, -0.5, 0.0, 0.0,
    0.5, 0.5, 1.0, 1.0,
    0.5, -0.5, 1.0, 0.0,
  ])
  const n = 4

  const vertexTexCoordBuffer = gl.createBuffer()
  if (!vertexTexCoordBuffer) {
    console.warn('Failed to create the buffer object')
    return -1
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW)

  // 获取每个元素所占的字节数
  const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  if (a_Position < 0) {
    console.warn('Failed to get the storage location of a_Position')
    return -1
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0)
  gl.enableVertexAttribArray(a_Position)
  // 分配a_Color
  const a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord')
  if (a_TexCoord < 0) {
    console.warn('Failed to get the storage location of a_TexCoord')
    return -1
  }
  // 此时 gl.ARRAY_BUFFER绑定的缓冲区是vertexColorBuffer
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2)
  gl.enableVertexAttribArray(a_TexCoord)

  return n
}

function initTextures(gl: WebGLRenderingContext, n: number) {
  // 新增，多纹理
  const texture0 = gl.createTexture()
  const texture1 = gl.createTexture()
  if (!texture0 || !texture1) {
    console.warn('Failed to create the texture object')
    return false
  }

  // Get the storage location of u_Sampler
  const u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0')
  const u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1')
  if (!u_Sampler0 || !u_Sampler1) {
    console.warn('Failed to get the storage location of u_Sampler0 or u_Sampler1')
    return false
  }
  const image0 = new Image()
  const image1 = new Image()
  if (!image0 || !image1) {
    console.warn('Failed to create the image object')
    return false
  }
  // 注册事件处理函数，当图片加载完成时调用
  image0.onload = () => loadTexture(gl, n, texture0, u_Sampler0, image0, 0)
  image1.onload = () => loadTexture(gl, n, texture1, u_Sampler1, image1, 1)
  // 告诉浏览器加载图片
  image0.src = sky
  image1.src = circle

  return true
}

// 标记纹理单元是否就绪
let g_texUnit0 = false
let g_texUnit1 = false
function loadTexture(
  gl: WebGLRenderingContext,
  n: number,
  texture: WebGLTexture,
  u_Sampler: WebGLUniformLocation,
  image: HTMLImageElement,
  texUnit: number,
) {
  // 翻转图片的y轴（因为WebGL中纹理坐标与图片本身纹理坐标Y轴相反）
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)

  // 新增
  // 启用纹理单元
  if (texUnit === 0) {
    gl.activeTexture(gl.TEXTURE0)
    g_texUnit0 = true
  }
  else {
    gl.activeTexture(gl.TEXTURE1)
    g_texUnit1 = true
  }

  // 2、绑定纹理对象到目标
  gl.bindTexture(gl.TEXTURE_2D, texture)
  // 3、设置纹理参数，设置纹理图片映射到图形上的方式
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  // 4、将图片分配给纹理对象，设置图片分配给纹理对象的参数
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
  // 5、将纹理单元0赋值给取样器u_Sampler
  gl.uniform1i(u_Sampler, texUnit)

  // 清空<canvas>
  gl.clear(gl.COLOR_BUFFER_BIT)

  if (g_texUnit0 && g_texUnit1) {
    // 绘制矩形
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n)
  }
}
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h2>重复纹理</h2>
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
