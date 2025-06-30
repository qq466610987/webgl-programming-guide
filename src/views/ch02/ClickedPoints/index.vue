<script setup lang="ts">
import { onMounted } from 'vue'

// 顶点着色器程序
const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = 10.0;
  }
`

// 片元着色器程序
const FSHADER_SOURCE = `
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`

// 鼠标点击点的数组
const g_points: number[] = []

onMounted(() => {
  main()
})

function main() {
  // 获取<canvas>元素
  const canvas = document.getElementById('webgl') as HTMLCanvasElement
  if (!canvas) {
    console.error('Failed to retrieve the <canvas> element')
    return
  }

  // 获取WebGL绘图上下文
  const gl = canvas.getContext('webgl')
  if (!gl) {
    console.error('Failed to get the rendering context for WebGL')
    return
  }

  // 初始化着色器
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.error('Failed to initialize shaders.')
    return
  }

  // 获取a_Position变量的存储位置
  const program = gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram
  const a_Position = gl.getAttribLocation(program, 'a_Position')
  if (a_Position < 0) {
    console.error('Failed to get the storage location of a_Position')
    return
  }

  // 注册鼠标点击事件响应函数
  canvas.addEventListener('mousedown', ev => click(ev, gl, canvas, a_Position))

  // 指定清空<canvas>的颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  // 清空<canvas>
  gl.clear(gl.COLOR_BUFFER_BIT)
}

function click(ev: MouseEvent, gl: WebGLRenderingContext, canvas: HTMLCanvasElement, a_Position: number) {
  let x = ev.clientX // 鼠标点击处的x坐标
  let y = ev.clientY // 鼠标点击处的y坐标
  const rect = canvas.getBoundingClientRect()

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2)
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2)

  // 将坐标存储到g_points数组中
  g_points.push(x)
  g_points.push(y)

  // 清空<canvas>
  gl.clear(gl.COLOR_BUFFER_BIT)

  const len = g_points.length
  for (let i = 0; i < len; i += 2) {
    // 将点的位置传递给a_Position变量
    gl.vertexAttrib3f(a_Position, g_points[i], g_points[i + 1], 0.0)

    // 绘制点
    gl.drawArrays(gl.POINTS, 0, 1)
  }
}

function initShaders(gl: WebGLRenderingContext, vshader: string, fshader: string): boolean {
  const program = createProgram(gl, vshader, fshader)
  if (!program) {
    console.error('Failed to create program')
    return false
  }

  gl.useProgram(program)
  return true
}

function createProgram(gl: WebGLRenderingContext, vshader: string, fshader: string): WebGLProgram | null {
  // 创建着色器对象
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader)
  if (!vertexShader || !fragmentShader) {
    return null
  }

  // 创建程序对象
  const program = gl.createProgram()
  if (!program) {
    return null
  }

  // 为程序对象分配着色器
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)

  // 连接程序对象
  gl.linkProgram(program)

  // 检查连接结果
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (!linked) {
    const error = gl.getProgramInfoLog(program)
    console.error(`Failed to link program: ${error}`)
    gl.deleteProgram(program)
    gl.deleteShader(fragmentShader)
    gl.deleteShader(vertexShader)
    return null
  }
  return program
}

function loadShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  // 创建着色器对象
  const shader = gl.createShader(type)
  if (shader == null) {
    console.error('unable to create shader')
    return null
  }

  // 设置着色器的源代码
  gl.shaderSource(shader, source)

  // 编译着色器
  gl.compileShader(shader)

  // 检查编译结果
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (!compiled) {
    const error = gl.getShaderInfoLog(shader)
    console.error(`Failed to compile shader: ${error}`)
    gl.deleteShader(shader)
    return null
  }

  return shader
}
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h2>ClickedPoints - 鼠标点击绘制点</h2>
      <p>点击画布任意位置绘制红色的点</p>
    </div>
    <div class="canvas-container">
      <canvas id="webgl" width="400" height="400" />
    </div>
    <div class="demo-info">
      <p>💡 提示：点击画布上的任意位置来绘制点</p>
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
  cursor: crosshair;
}

.demo-info {
  text-align: center;
  margin-top: 1rem;
}

.demo-info p {
  color: #666;
  font-size: 0.9rem;
}
</style>
