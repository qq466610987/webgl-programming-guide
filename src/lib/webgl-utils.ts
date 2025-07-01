/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @fileoverview This file contains functions every webgl program will need
 * a version of one way or another.
 *
 * Instead of setting up a context manually it is recommended to
 * use. This will check for success or failure. On failure it
 * will attempt to present an approriate message to the user.
 *
 *       gl = WebGLUtils.setupWebGL(canvas);
 *
 * For animated WebGL apps use of setTimeout or setInterval are
 * discouraged. It is recommended you structure your rendering
 * loop like this.
 *
 *       function render() {
 *         window.requestAnimationFrame(render, canvas);
 *
 *         // do rendering
 *         ...
 *       }
 *       render();
 *
 * This will call your rendering function up to the refresh rate
 * of your display but will stop rendering if your app is not
 * visible.
 */

// 扩展Window接口以支持旧版浏览器的requestAnimationFrame
declare global {
  interface Window {
    webkitRequestAnimationFrame?: (callback: FrameRequestCallback) => number
    mozRequestAnimationFrame?: (callback: FrameRequestCallback) => number
    oRequestAnimationFrame?: (callback: FrameRequestCallback) => number
    msRequestAnimationFrame?: (callback: FrameRequestCallback) => number
    cancelRequestAnimationFrame?: (handle: number) => void
    webkitCancelAnimationFrame?: (handle: number) => void
    webkitCancelRequestAnimationFrame?: (handle: number) => void
    mozCancelAnimationFrame?: (handle: number) => void
    mozCancelRequestAnimationFrame?: (handle: number) => void
    msCancelAnimationFrame?: (handle: number) => void
    msCancelRequestAnimationFrame?: (handle: number) => void
    oCancelAnimationFrame?: (handle: number) => void
    oCancelRequestAnimationFrame?: (handle: number) => void
  }
}

interface WebGLUtilsInterface {
  create3DContext: (canvas: HTMLCanvasElement, opt_attribs?: WebGLContextAttributes) => WebGLRenderingContext | null
  setupWebGL: (canvas: HTMLCanvasElement, opt_attribs?: WebGLContextAttributes, opt_onError?: (msg: string) => void) => WebGLRenderingContext | null
}

/**
 * Creates the HTML for a failure message
 * @param msg The message
 * @return The html.
 */
function makeFailHTML(msg: string): string {
  return `<div style="margin: auto; width:500px;z-index:10000;margin-top:20em;text-align:center;">${msg}</div>`
}

/**
 * Message for getting a webgl browser
 */
const GET_A_WEBGL_BROWSER
  = 'This page requires a browser that supports WebGL.<br/>'
    + '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>'

/**
 * Message for need better hardware
 */
const OTHER_PROBLEM
  = 'It doesn\'t appear your computer can support WebGL.<br/>'
    + '<a href="http://get.webgl.org">Click here for more information.</a>'

/**
 * Creates a webgl context. If creation fails it will
 * change the contents of the container of the <canvas>
 * tag to an error message with the correct links for WebGL.
 * @param canvas The canvas element to create a context from.
 * @param opt_attribs Any creation attributes you want to pass in.
 * @param opt_onError A function to call if there is an error during creation.
 * @return The created context.
 */
function setupWebGL(canvas: HTMLCanvasElement, opt_attribs?: WebGLContextAttributes, opt_onError?: (msg: string) => void): WebGLRenderingContext | null {
  const handleCreationError = (msg: string): void => {
    const container = document.getElementsByTagName('body')[0]
    if (container) {
      const str = window.WebGLRenderingContext
        ? OTHER_PROBLEM
        : GET_A_WEBGL_BROWSER
      const finalMsg = msg ? `${str}<br/><br/>Status: ${msg}` : str
      container.innerHTML = makeFailHTML(finalMsg)
    }
  }

  const onError = opt_onError || handleCreationError

  if (canvas.addEventListener) {
    canvas.addEventListener('webglcontextcreationerror', (event: Event) => {
      const webglEvent = event as any
      onError(webglEvent.statusMessage || '')
    }, false)
  }

  const context = create3DContext(canvas, opt_attribs)
  if (!context) {
    if (!window.WebGLRenderingContext) {
      onError('')
    }
    else {
      onError('')
    }
  }

  return context
}

/**
 * Creates a webgl context.
 * @param canvas The canvas tag to get context from. If one is not passed in one will be created.
 * @param opt_attribs Optional WebGL context attributes
 * @return The created context.
 */
function create3DContext(canvas: HTMLCanvasElement, opt_attribs?: WebGLContextAttributes): WebGLRenderingContext | null {
  const names = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl']
  let context: WebGLRenderingContext | null = null

  for (let ii = 0; ii < names.length; ++ii) {
    try {
      context = canvas.getContext(names[ii], opt_attribs) as WebGLRenderingContext
    }
    catch {
      // 忽略错误，继续尝试下一个
    }
    if (context) {
      break
    }
  }
  return context
}

const WebGLUtils: WebGLUtilsInterface = {
  create3DContext,
  setupWebGL,
}

/**
 * Provides requestAnimationFrame in a cross browser way.
 */
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = ((): (callback: FrameRequestCallback) => number => {
    return window.requestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.oRequestAnimationFrame
      || window.msRequestAnimationFrame
      || ((callback: FrameRequestCallback, _element?: Element): number => {
        return window.setTimeout(callback, 1000 / 60)
      })
  })()
}

/**
 * ERRATA: 'cancelRequestAnimationFrame' renamed to 'cancelAnimationFrame' to reflect an update to the W3C Animation-Timing Spec.
 *
 * Cancels an animation frame request.
 * Checks for cross-browser support, falls back to clearTimeout.
 * @param handle Animation frame request handle.
 */
if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = (window.cancelRequestAnimationFrame
    || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame
    || window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame
    || window.msCancelAnimationFrame || window.msCancelRequestAnimationFrame
    || window.oCancelAnimationFrame || window.oCancelRequestAnimationFrame
    || window.clearTimeout) as (handle: number) => void
}

export { WebGLUtils }
export type { WebGLUtilsInterface }
