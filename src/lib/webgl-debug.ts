// Copyright (c) 2009 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Various functions for helping debug WebGL apps.

type WebGLObjectType = WebGLBuffer | WebGLFramebuffer | WebGLProgram | WebGLRenderbuffer | WebGLShader | WebGLTexture

interface WebGLDebugUtilsInterface {
  init: (ctx: WebGLRenderingContext) => void
  mightBeEnum: (value: unknown) => boolean
  glEnumToString: (value: number) => string
  glFunctionArgToString: (functionName: string, argumentIndex: number, value: unknown) => string
  makeDebugContext: (ctx: WebGLRenderingContext, opt_onErrorFunc?: (err: number, funcName: string, args: IArguments) => void) => WebGLRenderingContext
  makeLostContextSimulatingContext: (ctx: WebGLRenderingContext) => WebGLRenderingContext & {
    loseContext: () => void
    restoreContext: () => void
    registerOnContextLostListener: (listener: EventListener) => void
    registerOnContextRestoredListener: (listener: EventListener) => void
    isContextLost: () => boolean
  }
  resetToInitialState: (ctx: WebGLRenderingContext) => void
}

interface EnumContexts {
  [key: string]: { [key: number]: boolean }
}

/**
 * Wrapped logging function.
 * @param msg Message to log.
 */
function log(msg: string): void {
  if (window.console && window.console.log) {
    window.console.log(msg)
  }
}

/**
 * Which arguments are enums.
 */
const glValidEnumContexts: EnumContexts = {
  // Generic setters and getters
  enable: { 0: true },
  disable: { 0: true },
  getParameter: { 0: true },

  // Rendering
  drawArrays: { 0: true },
  drawElements: { 0: true, 2: true },

  // Shaders
  createShader: { 0: true },
  getShaderParameter: { 1: true },
  getProgramParameter: { 1: true },

  // Vertex attributes
  getVertexAttrib: { 1: true },
  vertexAttribPointer: { 2: true },

  // Textures
  bindTexture: { 0: true },
  activeTexture: { 0: true },
  getTexParameter: { 0: true, 1: true },
  texParameterf: { 0: true, 1: true },
  texParameteri: { 0: true, 1: true, 2: true },
  texImage2D: { 0: true, 2: true, 6: true, 7: true },
  texSubImage2D: { 0: true, 6: true, 7: true },
  copyTexImage2D: { 0: true, 2: true },
  copyTexSubImage2D: { 0: true },
  generateMipmap: { 0: true },

  // Buffer objects
  bindBuffer: { 0: true },
  bufferData: { 0: true, 2: true },
  bufferSubData: { 0: true },
  getBufferParameter: { 0: true, 1: true },

  // Renderbuffers and framebuffers
  pixelStorei: { 0: true, 1: true },
  readPixels: { 4: true, 5: true },
  bindRenderbuffer: { 0: true },
  bindFramebuffer: { 0: true },
  checkFramebufferStatus: { 0: true },
  framebufferRenderbuffer: { 0: true, 1: true, 2: true },
  framebufferTexture2D: { 0: true, 1: true, 2: true },
  getFramebufferAttachmentParameter: { 0: true, 1: true, 2: true },
  getRenderbufferParameter: { 0: true, 1: true },
  renderbufferStorage: { 0: true, 1: true },

  // Frame buffer operations (clear, blend, depth test, stencil)
  clear: { 0: true },
  depthFunc: { 0: true },
  blendFunc: { 0: true, 1: true },
  blendFuncSeparate: { 0: true, 1: true, 2: true, 3: true },
  blendEquation: { 0: true },
  blendEquationSeparate: { 0: true, 1: true },
  stencilFunc: { 0: true },
  stencilFuncSeparate: { 0: true, 1: true },
  stencilMaskSeparate: { 0: true },
  stencilOp: { 0: true, 1: true, 2: true },
  stencilOpSeparate: { 0: true, 1: true, 2: true, 3: true },

  // Culling
  cullFace: { 0: true },
  frontFace: { 0: true },
}

/**
 * Map of numbers to names.
 */
let glEnums: { [key: number]: string } | null = null

/**
 * Initializes this module. Safe to call more than once.
 * @param ctx A WebGL context. If you have more than one context it doesn't matter which one
 *    you pass in, it is only used to pull out constants.
 */
function init(ctx: WebGLRenderingContext): void {
  if (glEnums == null) {
    glEnums = {}
    for (const propertyName in ctx) {
      const value = (ctx as any)[propertyName]
      if (typeof value === 'number') {
        glEnums[value] = propertyName
      }
    }
  }
}

/**
 * Checks the utils have been initialized.
 */
function checkInit(): void {
  if (glEnums == null) {
    throw new Error('WebGLDebugUtils.init(ctx) not called')
  }
}

/**
 * Returns true or false if value matches any WebGL enum
 * @param value Value to check if it might be an enum.
 * @return True if value matches one of the WebGL defined enums
 */
function mightBeEnum(value: unknown): boolean {
  checkInit()
  return (glEnums![value as number] !== undefined)
}

/**
 * Gets a string version of a WebGL enum.
 *
 * Example:
 *   const str = WebGLDebugUtil.glEnumToString(ctx.getError());
 *
 * @param value Value to return an enum for
 * @return The string version of the enum.
 */
function glEnumToString(value: number): string {
  checkInit()
  const name = glEnums![value]
  return (name !== undefined)
    ? name
    : (`*UNKNOWN WebGL ENUM (0x${value.toString(16)})`)
}

/**
 * Returns the string version of a WebGL argument.
 * Attempts to convert enum arguments to strings.
 * @param functionName the name of the WebGL function.
 * @param argumentIndex the index of the argument.
 * @param value The value of the argument.
 * @return The value as a string.
 */
function glFunctionArgToString(functionName: string, argumentIndex: number, value: unknown): string {
  const funcInfo = glValidEnumContexts[functionName]
  if (funcInfo !== undefined) {
    if (funcInfo[argumentIndex]) {
      return glEnumToString(value as number)
    }
  }
  return String(value)
}

/**
 * Given a WebGL context returns a wrapped context that calls
 * gl.getError after every command and calls a function if the
 * result is not gl.NO_ERROR.
 *
 * @param ctx The webgl context to wrap.
 * @param opt_onErrorFunc The function to call when gl.getError returns an
 *        error. If not specified the default function calls
 *        console.log with a message.
 */
function makeDebugContext(
  ctx: WebGLRenderingContext,
  opt_onErrorFunc?: (err: number, funcName: string, args: IArguments) => void,
): WebGLRenderingContext {
  init(ctx)
  const onErrorFunc = opt_onErrorFunc || ((err: number, functionName: string, args: IArguments) => {
    // apparently we can't do args.join(",");
    let argStr = ''
    for (let ii = 0; ii < args.length; ++ii) {
      argStr += ((ii == 0) ? '' : ', ')
        + glFunctionArgToString(functionName, ii, args[ii])
    }
    log(`WebGL error ${glEnumToString(err)} in ${functionName}(${argStr})`)
  })

  // Holds booleans for each GL error so after we get the error ourselves
  // we can still return it to the client app.
  const glErrorShadow: { [key: number]: boolean } = {}

  // Makes a function that calls a WebGL function and then calls getError.
  function makeErrorWrapper(ctx: WebGLRenderingContext, functionName: string) {
    return function (this: WebGLRenderingContext) {
      const result = (ctx as any)[functionName].apply(ctx, arguments)
      const err = ctx.getError()
      if (err != 0) {
        glErrorShadow[err] = true
        onErrorFunc(err, functionName, arguments)
      }
      return result
    }
  }

  // Make an object that has a copy of every property of the WebGL context
  // but wraps all functions.
  const wrapper: any = {}
  for (const propertyName in ctx) {
    const property = (ctx as any)[propertyName]
    if (typeof property === 'function') {
      wrapper[propertyName] = makeErrorWrapper(ctx, propertyName)
    }
    else {
      wrapper[propertyName] = property
    }
  }

  // Override the getError function with one that returns our saved results.
  wrapper.getError = function () {
    for (const err in glErrorShadow) {
      if (glErrorShadow[err]) {
        glErrorShadow[err] = false
        return Number(err)
      }
    }
    return ctx.NO_ERROR
  }

  return wrapper as WebGLRenderingContext
}

function resetToInitialState(ctx: WebGLRenderingContext): void {
  const numAttribs = ctx.getParameter(ctx.MAX_VERTEX_ATTRIBS)
  const tmp = ctx.createBuffer()
  ctx.bindBuffer(ctx.ARRAY_BUFFER, tmp)
  for (let ii = 0; ii < numAttribs; ++ii) {
    ctx.disableVertexAttribArray(ii)
    ctx.vertexAttribPointer(ii, 4, ctx.FLOAT, false, 0, 0)
    ctx.vertexAttrib1f(ii, 0)
  }
  ctx.deleteBuffer(tmp)

  const numTextureUnits = ctx.getParameter(ctx.MAX_TEXTURE_IMAGE_UNITS)
  for (let ii = 0; ii < numTextureUnits; ++ii) {
    ctx.activeTexture(ctx.TEXTURE0 + ii)
    ctx.bindTexture(ctx.TEXTURE_CUBE_MAP, null)
    ctx.bindTexture(ctx.TEXTURE_2D, null)
  }

  ctx.activeTexture(ctx.TEXTURE0)
  ctx.useProgram(null)
  ctx.bindBuffer(ctx.ARRAY_BUFFER, null)
  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null)
  ctx.bindFramebuffer(ctx.FRAMEBUFFER, null)
  ctx.bindRenderbuffer(ctx.RENDERBUFFER, null)
  ctx.disable(ctx.BLEND)
  ctx.disable(ctx.CULL_FACE)
  ctx.disable(ctx.DEPTH_TEST)
  ctx.disable(ctx.DITHER)
  ctx.disable(ctx.SCISSOR_TEST)
  ctx.blendColor(0, 0, 0, 0)
  ctx.blendEquation(ctx.FUNC_ADD)
  ctx.blendFunc(ctx.ONE, ctx.ZERO)
  ctx.clearColor(0, 0, 0, 0)
  ctx.clearDepth(1)
  ctx.clearStencil(-1)
  ctx.colorMask(true, true, true, true)
  ctx.cullFace(ctx.BACK)
  ctx.depthFunc(ctx.LESS)
  ctx.depthMask(true)
  ctx.depthRange(0, 1)
  ctx.frontFace(ctx.CCW)
  ctx.hint(ctx.GENERATE_MIPMAP_HINT, ctx.DONT_CARE)
  ctx.lineWidth(1)
  ctx.pixelStorei(ctx.PACK_ALIGNMENT, 4)
  ctx.pixelStorei(ctx.UNPACK_ALIGNMENT, 4)
  ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false)
  ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
  // TODO: Delete this IF.
  if ((ctx as any).UNPACK_COLORSPACE_CONVERSION_WEBGL) {
    ctx.pixelStorei((ctx as any).UNPACK_COLORSPACE_CONVERSION_WEBGL, (ctx as any).BROWSER_DEFAULT_WEBGL)
  }
  ctx.polygonOffset(0, 0)
  ctx.sampleCoverage(1, false)
  ctx.scissor(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.stencilFunc(ctx.ALWAYS, 0, 0xFFFFFFFF)
  ctx.stencilMask(0xFFFFFFFF)
  ctx.stencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP)
  const canvas = ctx.canvas as HTMLCanvasElement
  ctx.viewport(0, 0, canvas.clientWidth, canvas.clientHeight)
  ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT | ctx.STENCIL_BUFFER_BIT)

  // TODO: This should NOT be needed but Firefox fails with 'hint'
  while (ctx.getError()) {
    // 继续获取错误直到没有错误
  }
}

function makeLostContextSimulatingContext(
  ctx: WebGLRenderingContext,
): WebGLRenderingContext & {
  loseContext: () => void
  restoreContext: () => void
  registerOnContextLostListener: (listener: EventListener) => void
  registerOnContextRestoredListener: (listener: EventListener) => void
  isContextLost: () => boolean
} {
  const wrapper_: any = {}
  let contextId_ = 1
  let contextLost_ = false
  const resourceDb_: WebGLObjectType[] = []
  let onLost_: EventListener | undefined
  let onRestored_: EventListener | undefined
  let nextOnRestored_: EventListener | undefined

  // Holds booleans for each GL error so can simulate errors.
  const glErrorShadow_: { [key: number]: boolean } = {}

  function isWebGLObject(obj: unknown): obj is WebGLObjectType {
    return (obj instanceof WebGLBuffer
      || obj instanceof WebGLFramebuffer
      || obj instanceof WebGLProgram
      || obj instanceof WebGLRenderbuffer
      || obj instanceof WebGLShader
      || obj instanceof WebGLTexture)
  }

  function checkResources(args: IArguments): boolean {
    for (let ii = 0; ii < args.length; ++ii) {
      const arg = args[ii]
      if (isWebGLObject(arg)) {
        return (arg as any).__webglDebugContextLostId__ == contextId_
      }
    }
    return true
  }

  function clearErrors(): void {
    const k = Object.keys(glErrorShadow_)
    for (let ii = 0; ii < k.length; ++ii) {
      delete glErrorShadow_[Number(k[ii])]
    }
  }

  // Makes a function that simulates WebGL when out of context.
  function makeLostContextWrapper(ctx: WebGLRenderingContext, functionName: string) {
    const f = (ctx as any)[functionName]
    return function (this: WebGLRenderingContext) {
      // Only call the functions if the context is not lost.
      if (!contextLost_) {
        if (!checkResources(arguments)) {
          glErrorShadow_[ctx.INVALID_OPERATION] = true
          return
        }
        const result = f.apply(ctx, arguments)
        return result
      }
    }
  }

  for (const propertyName in ctx) {
    const property = (ctx as any)[propertyName]
    if (typeof property === 'function') {
      wrapper_[propertyName] = makeLostContextWrapper(ctx, propertyName)
    }
    else {
      wrapper_[propertyName] = property
    }
  }

  function makeWebGLContextEvent(statusMessage: string) {
    return { statusMessage }
  }

  function freeResources(): void {
    for (let ii = 0; ii < resourceDb_.length; ++ii) {
      const resource = resourceDb_[ii]
      if (resource instanceof WebGLBuffer) {
        ctx.deleteBuffer(resource)
      }
      else if (resource instanceof WebGLFramebuffer) {
        ctx.deleteFramebuffer(resource)
      }
      else if (resource instanceof WebGLProgram) {
        ctx.deleteProgram(resource)
      }
      else if (resource instanceof WebGLRenderbuffer) {
        ctx.deleteRenderbuffer(resource)
      }
      else if (resource instanceof WebGLShader) {
        ctx.deleteShader(resource)
      }
      else if (resource instanceof WebGLTexture) {
        ctx.deleteTexture(resource)
      }
    }
  }

  wrapper_.loseContext = function () {
    if (!contextLost_) {
      contextLost_ = true
      ++contextId_
      while (ctx.getError()) {
        // 清除所有错误
      }
      clearErrors()
      glErrorShadow_[ctx.CONTEXT_LOST_WEBGL] = true
      setTimeout(() => {
        if (onLost_) {
          onLost_(makeWebGLContextEvent('context lost') as unknown as Event)
        }
      }, 0)
    }
  }

  wrapper_.restoreContext = function () {
    if (contextLost_) {
      if (onRestored_) {
        setTimeout(() => {
          freeResources()
          resetToInitialState(ctx)
          contextLost_ = false
          if (onRestored_) {
            const callback = onRestored_
            onRestored_ = nextOnRestored_
            nextOnRestored_ = undefined
            callback(makeWebGLContextEvent('context restored') as unknown as Event)
          }
        }, 0)
      }
      else {
        throw new Error('You can not restore the context without a listener')
      }
    }
  }

  // Wrap a few functions specially.
  wrapper_.getError = function () {
    if (!contextLost_) {
      let err: number
      while ((err = ctx.getError())) {
        glErrorShadow_[err] = true
      }
    }
    for (const err in glErrorShadow_) {
      if (glErrorShadow_[err]) {
        delete glErrorShadow_[err]
        return Number(err)
      }
    }
    return ctx.NO_ERROR
  }

  const creationFunctions = [
    'createBuffer',
    'createFramebuffer',
    'createProgram',
    'createRenderbuffer',
    'createShader',
    'createTexture',
  ]

  for (let ii = 0; ii < creationFunctions.length; ++ii) {
    const functionName = creationFunctions[ii]
    wrapper_[functionName] = (function (f) {
      return function () {
        if (contextLost_) {
          return null
        }
        const obj = f.apply(ctx, arguments) as WebGLObjectType
        if (obj) {
          (obj as any).__webglDebugContextLostId__ = contextId_
          resourceDb_.push(obj)
        }
        return obj
      }
    })((ctx as any)[functionName])
  }

  const functionsThatShouldReturnNull = [
    'getActiveAttrib',
    'getActiveUniform',
    'getBufferParameter',
    'getContextAttributes',
    'getAttachedShaders',
    'getFramebufferAttachmentParameter',
    'getParameter',
    'getProgramParameter',
    'getProgramInfoLog',
    'getRenderbufferParameter',
    'getShaderParameter',
    'getShaderInfoLog',
    'getShaderSource',
    'getTexParameter',
    'getUniform',
    'getUniformLocation',
    'getVertexAttrib',
  ]

  for (let ii = 0; ii < functionsThatShouldReturnNull.length; ++ii) {
    const functionName = functionsThatShouldReturnNull[ii]
    wrapper_[functionName] = (function (f) {
      return function () {
        if (contextLost_) {
          return null
        }
        return f.apply(ctx, arguments)
      }
    })(wrapper_[functionName])
  }

  const isFunctions = [
    'isBuffer',
    'isEnabled',
    'isFramebuffer',
    'isProgram',
    'isRenderbuffer',
    'isShader',
    'isTexture',
  ]

  for (let ii = 0; ii < isFunctions.length; ++ii) {
    const functionName = isFunctions[ii]
    wrapper_[functionName] = (function (f) {
      return function () {
        if (contextLost_) {
          return false
        }
        return f.apply(ctx, arguments)
      }
    })(wrapper_[functionName])
  }

  wrapper_.checkFramebufferStatus = (function (f) {
    return function () {
      if (contextLost_) {
        return ctx.FRAMEBUFFER_UNSUPPORTED
      }
      return f.apply(ctx, arguments)
    }
  })(wrapper_.checkFramebufferStatus)

  wrapper_.getAttribLocation = (function (f) {
    return function () {
      if (contextLost_) {
        return -1
      }
      return f.apply(ctx, arguments)
    }
  })(wrapper_.getAttribLocation)

  wrapper_.getVertexAttribOffset = (function (f) {
    return function () {
      if (contextLost_) {
        return 0
      }
      return f.apply(ctx, arguments)
    }
  })(wrapper_.getVertexAttribOffset)

  wrapper_.isContextLost = function () {
    return contextLost_
  }

  function wrapEvent(listener: EventListener | EventListenerObject): EventListener {
    if (typeof listener === 'function') {
      return listener
    }
    else {
      return function (info: Event) {
        listener.handleEvent(info)
      }
    }
  }

  wrapper_.registerOnContextLostListener = function (listener: EventListener) {
    onLost_ = wrapEvent(listener)
  }

  wrapper_.registerOnContextRestoredListener = function (listener: EventListener) {
    if (contextLost_) {
      nextOnRestored_ = wrapEvent(listener)
    }
    else {
      onRestored_ = wrapEvent(listener)
    }
  }

  return wrapper_
}

const WebGLDebugUtils: WebGLDebugUtilsInterface = {
  init,
  mightBeEnum,
  glEnumToString,
  glFunctionArgToString,
  makeDebugContext,
  makeLostContextSimulatingContext,
  resetToInitialState,
}

export { WebGLDebugUtils }
export type { WebGLDebugUtilsInterface }
