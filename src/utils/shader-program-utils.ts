export const shaderProgramUtils = {
  initWebglContext,
  initShaders,
  createProgram,
  loadShader,
}
function initWebglContext(): WebGLRenderingContext | void {
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
  return gl
}

function initShaders(gl: WebGLRenderingContext, vshader: string, fshader: string): boolean {
  const program = createProgram(gl, vshader, fshader)
  if (!program) {
    console.error('Failed to create program')
    return false
  }

  gl.useProgram(program)
  // 将程序附加到gl对象上，以便后续访问
  ;(gl as any).program = program
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
    console.warn('unable to create shader')
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
    console.warn(`Failed to compile shader: ${error}`)
    gl.deleteShader(shader)
    return null
  }

  return shader
}
