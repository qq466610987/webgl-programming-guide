// 扩展 WebGLRenderingContext 接口，添加 program 属性
declare global {
  interface WebGLRenderingContext {
    program: WebGLProgram
  }
}

// 为 .glsl 文件添加模块声明
declare module '*.glsl' {
  const content: string
  export default content
}

export {}
