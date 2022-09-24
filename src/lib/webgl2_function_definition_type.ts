// prettier-ignore
/** not use this */
export const __UNSAFE_WEBGL2_FUNC_DEFINITION: Record<string, string[]> = {
  beginQuery: ["target: GLenum", "query: WebGLQuery"],
  beginTransformFeedback: ["primitiveMode: GLenum"],
  bindBufferBase: ["target: GLenum", "index: GLuint", "buffer: WebGLBuffer | null"],
  bindBufferRange: ["target: GLenum", "index: GLuint", "buffer: WebGLBuffer | null", "offset: GLintptr", "size: GLsizeiptr"],
  bindSampler: ["unit: GLuint", "sampler: WebGLSampler | null"],
  bindTransformFeedback: ["target: GLenum", "tf: WebGLTransformFeedback | null"],
  bindVertexArray: ["array: WebGLVertexArrayObject | null"],
  blitFramebuffer: ["srcX0: GLint", "srcY0: GLint", "srcX1: GLint", "srcY1: GLint", "dstX0: GLint", "dstY0: GLint", "dstX1: GLint", "dstY1: GLint", "mask: GLbitfield", "filter: GLenum"],
  clearBufferfi: ["buffer: GLenum", "drawbuffer: GLint", "depth: GLfloat", "stencil: GLint"],
  clearBufferfv: ["buffer: GLenum", "drawbuffer: GLint", "values: Float32List", "srcOffset?: GLuint"],
  clearBufferiv: ["buffer: GLenum", "drawbuffer: GLint", "values: Int32List", "srcOffset?: GLuint"],
  clearBufferuiv: ["buffer: GLenum", "drawbuffer: GLint", "values: Uint32List", "srcOffset?: GLuint"],
  clientWaitSync: ["sync: WebGLSync", "flags: GLbitfield", "timeout: GLuint64"],
  // compressedTexImage3D: ["target: GLenum", "level: GLint", "internalformat: GLenum", "width: GLsizei", "height: GLsizei", "depth: GLsizei", "border: GLint", "imageSize: GLsizei", "offset: GLintptr"],
  compressedTexImage3D: ["target: GLenum", "level: GLint", "internalformat: GLenum", "width: GLsizei", "height: GLsizei", "depth: GLsizei", "border: GLint", "srcData: ArrayBufferView", "srcOffset?: GLuint", "srcLengthOverride?: GLuint"],
  // compressedTexSubImage3D: ["target: GLenum", "level: GLint", "xoffset: GLint", "yoffset: GLint", "zoffset: GLint", "width: GLsizei", "height: GLsizei", "depth: GLsizei", "format: GLenum", "imageSize: GLsizei", "offset: GLintptr"],
  compressedTexSubImage3D: ["target: GLenum", "level: GLint", "xoffset: GLint", "yoffset: GLint", "zoffset: GLint", "width: GLsizei", "height: GLsizei", "depth: GLsizei", "format: GLenum", "srcData: ArrayBufferView", "srcOffset?: GLuint", "srcLengthOverride?: GLuint"],
  copyBufferSubData: ["readTarget: GLenum", "writeTarget: GLenum", "readOffset: GLintptr", "writeOffset: GLintptr", "size: GLsizeiptr"],
  copyTexSubImage3D: ["target: GLenum", "level: GLint", "xoffset: GLint", "yoffset: GLint", "zoffset: GLint", "x: GLint", "y: GLint", "width: GLsizei", "height: GLsizei"],
  createQuery: [],
  createSampler: [],
  createTransformFeedback: [],
  createVertexArray: [],
  deleteQuery: ["query: WebGLQuery | null"],
  deleteSampler: ["sampler: WebGLSampler | null"],
  deleteSync: ["sync: WebGLSync | null"],
  deleteTransformFeedback: ["tf: WebGLTransformFeedback | null"],
  deleteVertexArray: ["vertexArray: WebGLVertexArrayObject | null"],
  drawArraysInstanced: ["mode: GLenum", "first: GLint", "count: GLsizei", "instanceCount: GLsizei"],
  drawBuffers: ["buffers: GLenum"],
  drawElementsInstanced: ["mode: GLenum", "count: GLsizei", "type: GLenum", "offset: GLintptr", "instanceCount: GLsizei"],
  drawRangeElements: ["mode: GLenum", "start: GLuint", "end: GLuint", "count: GLsizei", "type: GLenum", "offset: GLintptr"],
  endQuery: ["target: GLenum"],
  endTransformFeedback: [],
  fenceSync: ["condition: GLenum", "flags: GLbitfield"],
  framebufferTextureLayer: ["target: GLenum", "attachment: GLenum", "texture: WebGLTexture | null", "level: GLint", "layer: GLint"],
  getActiveUniformBlockName: ["program: WebGLProgram", "uniformBlockIndex: GLuint"],
  getActiveUniformBlockParameter: ["program: WebGLProgram", "uniformBlockIndex: GLuint", "pname: GLenum"],
  getActiveUniforms: ["program: WebGLProgram", "uniformIndices: GLuint", "pname: GLenum"],
  getBufferSubData: ["target: GLenum", "srcByteOffset: GLintptr", "dstBuffer: ArrayBufferView", "dstOffset?: GLuint", "length?: GLuint"],
  getFragDataLocation: ["program: WebGLProgram", "name: string"],
  getIndexedParameter: ["target: GLenum", "index: GLuint"],
  getInternalformatParameter: ["target: GLenum", "internalformat: GLenum", "pname: GLenum"],
  getQuery: ["target: GLenum", "pname: GLenum"],
  getQueryParameter: ["query: WebGLQuery", "pname: GLenum"],
  getSamplerParameter: ["sampler: WebGLSampler", "pname: GLenum"],
  getSyncParameter: ["sync: WebGLSync", "pname: GLenum"],
  getTransformFeedbackVarying: ["program: WebGLProgram", "index: GLuint"],
  getUniformBlockIndex: ["program: WebGLProgram", "uniformBlockName: string"],
  getUniformIndices: ["program: WebGLProgram", "uniformNames: string"],
  invalidateFramebuffer: ["target: GLenum", "attachments: GLenum"],
  invalidateSubFramebuffer: ["target: GLenum", "attachments: GLenum", "x: GLint", "y: GLint", "width: GLsizei", "height: GLsizei"],
  isQuery: ["query: WebGLQuery | null"],
  isSampler: ["sampler: WebGLSampler | null"],
  isSync: ["sync: WebGLSync | null"],
  isTransformFeedback: ["tf: WebGLTransformFeedback | null"],
  isVertexArray: ["vertexArray: WebGLVertexArrayObject | null"],
  pauseTransformFeedback: [],
  readBuffer: ["src: GLenum"],
  renderbufferStorageMultisample: ["target: GLenum", "samples: GLsizei", "internalformat: GLenum", "width: GLsizei", "height: GLsizei"],
  resumeTransformFeedback: [],
  samplerParameterf: ["sampler: WebGLSampler", "pname: GLenum", "param: GLfloat"],
  samplerParameteri: ["sampler: WebGLSampler", "pname: GLenum", "param: GLint"],
  texImage3D: ["target: GLenum", "level: GLint", "internalformat: GLint", "width: GLsizei", "height: GLsizei", "depth: GLsizei", "border: GLint", "format: GLenum", "type: GLenum", "pboOffset: GLintptr"],
  // texImage3D: ["target: GLenum", "level: GLint", "internalformat: GLint", "width: GLsizei", "height: GLsizei", "depth: GLsizei", "border: GLint", "format: GLenum", "type: GLenum", "source: TexImageSource"],
  // texImage3D: ["target: GLenum", "level: GLint", "internalformat: GLint", "width: GLsizei", "height: GLsizei", "depth: GLsizei", "border: GLint", "format: GLenum", "type: GLenum", "srcData: ArrayBufferView | null"],
  // texImage3D: ["target: GLenum", "level: GLint", "internalformat: GLint", "width: GLsizei", "height: GLsizei", "depth: GLsizei", "border: GLint", "format: GLenum", "type: GLenum", "srcData: ArrayBufferView", "srcOffset: GLuint"],
  texStorage2D: ["target: GLenum", "levels: GLsizei", "internalformat: GLenum", "width: GLsizei", "height: GLsizei"],
  texStorage3D: ["target: GLenum", "levels: GLsizei", "internalformat: GLenum", "width: GLsizei", "height: GLsizei", "depth: GLsizei"],
  texSubImage3D: ["target: GLenum", "level: GLint", "xoffset: GLint", "yoffset: GLint", "zoffset: GLint", "width: GLsizei", "height: GLsizei", "depth: GLsizei", "format: GLenum", "type: GLenum", "pboOffset: GLintptr"],
  // texSubImage3D: ["target: GLenum", "level: GLint", "xoffset: GLint", "yoffset: GLint", "zoffset: GLint", "width: GLsizei", "height: GLsizei", "depth: GLsizei", "format: GLenum", "type: GLenum", "source: TexImageSource"],
  // texSubImage3D: ["target: GLenum", "level: GLint", "xoffset: GLint", "yoffset: GLint", "zoffset: GLint", "width: GLsizei", "height: GLsizei", "depth: GLsizei", "format: GLenum", "type: GLenum", "srcData: ArrayBufferView | null", "srcOffset?: GLuint"],
  transformFeedbackVaryings: ["program: WebGLProgram", "varyings: string", "bufferMode: GLenum"],
  uniform1ui: ["location: WebGLUniformLocation | null", "v0: GLuint"],
  uniform1uiv: ["location: WebGLUniformLocation | null", "data: Uint32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  uniform2ui: ["location: WebGLUniformLocation | null", "v0: GLuint", "v1: GLuint"],
  uniform2uiv: ["location: WebGLUniformLocation | null", "data: Uint32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  uniform3ui: ["location: WebGLUniformLocation | null", "v0: GLuint", "v1: GLuint", "v2: GLuint"],
  uniform3uiv: ["location: WebGLUniformLocation | null", "data: Uint32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  uniform4ui: ["location: WebGLUniformLocation | null", "v0: GLuint", "v1: GLuint", "v2: GLuint", "v3: GLuint"],
  uniform4uiv: ["location: WebGLUniformLocation | null", "data: Uint32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  uniformBlockBinding: ["program: WebGLProgram", "uniformBlockIndex: GLuint", "uniformBlockBinding: GLuint"],
  uniformMatrix2x3fv: ["location: WebGLUniformLocation | null", "transpose: GLboolean", "data: Float32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  uniformMatrix2x4fv: ["location: WebGLUniformLocation | null", "transpose: GLboolean", "data: Float32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  uniformMatrix3x2fv: ["location: WebGLUniformLocation | null", "transpose: GLboolean", "data: Float32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  uniformMatrix3x4fv: ["location: WebGLUniformLocation | null", "transpose: GLboolean", "data: Float32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  uniformMatrix4x2fv: ["location: WebGLUniformLocation | null", "transpose: GLboolean", "data: Float32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  uniformMatrix4x3fv: ["location: WebGLUniformLocation | null", "transpose: GLboolean", "data: Float32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  vertexAttribDivisor: ["index: GLuint", "divisor: GLuint"],
  vertexAttribI4i: ["index: GLuint", "x: GLint", "y: GLint", "z: GLint", "w: GLint"],
  vertexAttribI4iv: ["index: GLuint", "values: Int32List"],
  vertexAttribI4ui: ["index: GLuint", "x: GLuint", "y: GLuint", "z: GLuint", "w: GLuint"],
  vertexAttribI4uiv: ["index: GLuint", "values: Uint32List"],
  vertexAttribIPointer: ["index: GLuint", "size: GLint", "type: GLenum", "stride: GLsizei", "offset: GLintptr"],
  waitSync: ["sync: WebGLSync", "flags: GLbitfield", "timeout: GLint64"],
  // bufferData: ["target: GLenum", "size: GLsizeiptr", "usage: GLenum"],
  // bufferData: ["target: GLenum", "srcData: BufferSource | null", "usage: GLenum"],
  bufferData: ["target: GLenum", "srcData: ArrayBufferView", "usage: GLenum", "srcOffset: GLuint", "length?: GLuint"],
  // bufferSubData: ["target: GLenum", "dstByteOffset: GLintptr", "srcData: BufferSource"],
  bufferSubData: ["target: GLenum", "dstByteOffset: GLintptr", "srcData: ArrayBufferView", "srcOffset: GLuint", "length?: GLuint"],
  // compressedTexImage2D: ["target: GLenum", "level: GLint", "internalformat: GLenum", "width: GLsizei", "height: GLsizei", "border: GLint", "imageSize: GLsizei", "offset: GLintptr"],
  compressedTexImage2D: ["target: GLenum", "level: GLint", "internalformat: GLenum", "width: GLsizei", "height: GLsizei", "border: GLint", "srcData: ArrayBufferView", "srcOffset?: GLuint", "srcLengthOverride?: GLuint"],
  // compressedTexSubImage2D: ["target: GLenum", "level: GLint", "xoffset: GLint", "yoffset: GLint", "width: GLsizei", "height: GLsizei", "format: GLenum", "imageSize: GLsizei", "offset: GLintptr"],
  compressedTexSubImage2D: ["target: GLenum", "level: GLint", "xoffset: GLint", "yoffset: GLint", "width: GLsizei", "height: GLsizei", "format: GLenum", "srcData: ArrayBufferView", "srcOffset?: GLuint", "srcLengthOverride?: GLuint"],
  // readPixels: ["x: GLint", "y: GLint", "width: GLsizei", "height: GLsizei", "format: GLenum", "type: GLenum", "dstData: ArrayBufferView | null"],
  // readPixels: ["x: GLint", "y: GLint", "width: GLsizei", "height: GLsizei", "format: GLenum", "type: GLenum", "offset: GLintptr"],
  readPixels: ["x: GLint", "y: GLint", "width: GLsizei", "height: GLsizei", "format: GLenum", "type: GLenum", "dstData: ArrayBufferView", "dstOffset: GLuint"],
  // texImage2D: ["target: GLenum", "level: GLint", "internalformat: GLint", "width: GLsizei", "height: GLsizei", "border: GLint", "format: GLenum", "type: GLenum", "pixels: ArrayBufferView | null"],
  // texImage2D: ["target: GLenum", "level: GLint", "internalformat: GLint", "format: GLenum", "type: GLenum", "source: TexImageSource"],
  // texImage2D: ["target: GLenum", "level: GLint", "internalformat: GLint", "width: GLsizei", "height: GLsizei", "border: GLint", "format: GLenum", "type: GLenum", "pboOffset: GLintptr"],
  // texImage2D: ["target: GLenum", "level: GLint", "internalformat: GLint", "width: GLsizei", "height: GLsizei", "border: GLint", "format: GLenum", "type: GLenum", "source: TexImageSource"],
  texImage2D: ["target: GLenum", "level: GLint", "internalformat: GLint", "width: GLsizei", "height: GLsizei", "border: GLint", "format: GLenum", "type: GLenum", "srcData: ArrayBufferView", "srcOffset: GLuint"],
  // texSubImage2D: ["target: GLenum", "level: GLint", "xoffset: GLint", "yoffset: GLint", "width: GLsizei", "height: GLsizei", "format: GLenum", "type: GLenum", "pixels: ArrayBufferView | null"],
  // texSubImage2D: ["target: GLenum", "level: GLint", "xoffset: GLint", "yoffset: GLint", "format: GLenum", "type: GLenum", "source: TexImageSource"],
  // texSubImage2D: ["target: GLenum", "level: GLint", "xoffset: GLint", "yoffset: GLint", "width: GLsizei", "height: GLsizei", "format: GLenum", "type: GLenum", "pboOffset: GLintptr"],
  // texSubImage2D: ["target: GLenum", "level: GLint", "xoffset: GLint", "yoffset: GLint", "width: GLsizei", "height: GLsizei", "format: GLenum", "type: GLenum", "source: TexImageSource"],
  texSubImage2D: ["target: GLenum", "level: GLint", "xoffset: GLint", "yoffset: GLint", "width: GLsizei", "height: GLsizei", "format: GLenum", "type: GLenum", "srcData: ArrayBufferView", "srcOffset: GLuint"],
  uniform1fv: ["location: WebGLUniformLocation | null", "data: Float32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  uniform1iv: ["location: WebGLUniformLocation | null", "data: Int32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  uniform2fv: ["location: WebGLUniformLocation | null", "data: Float32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  uniform2iv: ["location: WebGLUniformLocation | null", "data: Int32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  uniform3fv: ["location: WebGLUniformLocation | null", "data: Float32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  uniform3iv: ["location: WebGLUniformLocation | null", "data: Int32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  uniform4fv: ["location: WebGLUniformLocation | null", "data: Float32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  uniform4iv: ["location: WebGLUniformLocation | null", "data: Int32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  uniformMatrix2fv: ["location: WebGLUniformLocation | null", "transpose: GLboolean", "data: Float32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  uniformMatrix3fv: ["location: WebGLUniformLocation | null", "transpose: GLboolean", "data: Float32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  uniformMatrix4fv: ["location: WebGLUniformLocation | null", "transpose: GLboolean", "data: Float32List", "srcOffset?: GLuint", "srcLength?: GLuint"],
  activeTexture: ["texture: GLenum"],
  attachShader: ["program: WebGLProgram", "shader: WebGLShader"],
  bindAttribLocation: ["program: WebGLProgram", "index: GLuint", "name: string"],
  bindBuffer: ["target: GLenum", "buffer: WebGLBuffer | null"],
  bindFramebuffer: ["target: GLenum", "framebuffer: WebGLFramebuffer | null"],
  bindRenderbuffer: ["target: GLenum", "renderbuffer: WebGLRenderbuffer | null"],
  bindTexture: ["target: GLenum", "texture: WebGLTexture | null"],
  blendColor: ["red: GLclampf", "green: GLclampf", "blue: GLclampf", "alpha: GLclampf"],
  blendEquation: ["mode: GLenum"],
  blendEquationSeparate: ["modeRGB: GLenum", "modeAlpha: GLenum"],
  blendFunc: ["sfactor: GLenum", "dfactor: GLenum"],
  blendFuncSeparate: ["srcRGB: GLenum", "dstRGB: GLenum", "srcAlpha: GLenum", "dstAlpha: GLenum"],
  checkFramebufferStatus: ["target: GLenum"],
  clear: ["mask: GLbitfield"],
  clearColor: ["red: GLclampf", "green: GLclampf", "blue: GLclampf", "alpha: GLclampf"],
  clearDepth: ["depth: GLclampf"],
  clearStencil: ["s: GLint"],
  colorMask: ["red: GLboolean", "green: GLboolean", "blue: GLboolean", "alpha: GLboolean"],
  compileShader: ["shader: WebGLShader"],
  copyTexImage2D: ["target: GLenum", "level: GLint", "internalformat: GLenum", "x: GLint", "y: GLint", "width: GLsizei", "height: GLsizei", "border: GLint"],
  copyTexSubImage2D: ["target: GLenum", "level: GLint", "xoffset: GLint", "yoffset: GLint", "x: GLint", "y: GLint", "width: GLsizei", "height: GLsizei"],
  createBuffer: [],
  createFramebuffer: [],
  createProgram: [],
  createRenderbuffer: [],
  createShader: ["type: GLenum"],
  createTexture: [],
  cullFace: ["mode: GLenum"],
  deleteBuffer: ["buffer: WebGLBuffer | null"],
  deleteFramebuffer: ["framebuffer: WebGLFramebuffer | null"],
  deleteProgram: ["program: WebGLProgram | null"],
  deleteRenderbuffer: ["renderbuffer: WebGLRenderbuffer | null"],
  deleteShader: ["shader: WebGLShader | null"],
  deleteTexture: ["texture: WebGLTexture | null"],
  depthFunc: ["func: GLenum"],
  depthMask: ["flag: GLboolean"],
  depthRange: ["zNear: GLclampf", "zFar: GLclampf"],
  detachShader: ["program: WebGLProgram", "shader: WebGLShader"],
  disable: ["cap: GLenum"],
  disableVertexAttribArray: ["index: GLuint"],
  drawArrays: ["mode: GLenum", "first: GLint", "count: GLsizei"],
  drawElements: ["mode: GLenum", "count: GLsizei", "type: GLenum", "offset: GLintptr"],
  enable: ["cap: GLenum"],
  enableVertexAttribArray: ["index: GLuint"],
  finish: [],
  flush: [],
  framebufferRenderbuffer: ["target: GLenum", "attachment: GLenum", "renderbuffertarget: GLenum", "renderbuffer: WebGLRenderbuffer | null"],
  framebufferTexture2D: ["target: GLenum", "attachment: GLenum", "textarget: GLenum", "texture: WebGLTexture | null", "level: GLint"],
  frontFace: ["mode: GLenum"],
  generateMipmap: ["target: GLenum"],
  getActiveAttrib: ["program: WebGLProgram", "index: GLuint"],
  getActiveUniform: ["program: WebGLProgram", "index: GLuint"],
  getAttachedShaders: ["program: WebGLProgram"],
  getAttribLocation: ["program: WebGLProgram", "name: string"],
  getBufferParameter: ["target: GLenum", "pname: GLenum"],
  getContextAttributes: [],
  getError: [],
  getFramebufferAttachmentParameter: ["target: GLenum", "attachment: GLenum", "pname: GLenum"],
  getParameter: ["pname: GLenum"],
  getProgramInfoLog: ["program: WebGLProgram"],
  getProgramParameter: ["program: WebGLProgram", "pname: GLenum"],
  getRenderbufferParameter: ["target: GLenum", "pname: GLenum"],
  getShaderInfoLog: ["shader: WebGLShader"],
  getShaderParameter: ["shader: WebGLShader", "pname: GLenum"],
  getShaderPrecisionFormat: ["shadertype: GLenum", "precisiontype: GLenum"],
  getShaderSource: ["shader: WebGLShader"],
  getSupportedExtensions: [],
  getTexParameter: ["target: GLenum", "pname: GLenum"],
  getUniform: ["program: WebGLProgram", "location: WebGLUniformLocation"],
  getUniformLocation: ["program: WebGLProgram", "name: string"],
  getVertexAttrib: ["index: GLuint", "pname: GLenum"],
  getVertexAttribOffset: ["index: GLuint", "pname: GLenum"],
  hint: ["target: GLenum", "mode: GLenum"],
  isBuffer: ["buffer: WebGLBuffer | null"],
  isContextLost: [],
  isEnabled: ["cap: GLenum"],
  isFramebuffer: ["framebuffer: WebGLFramebuffer | null"],
  isProgram: ["program: WebGLProgram | null"],
  isRenderbuffer: ["renderbuffer: WebGLRenderbuffer | null"],
  isShader: ["shader: WebGLShader | null"],
  isTexture: ["texture: WebGLTexture | null"],
  lineWidth: ["width: GLfloat"],
  linkProgram: ["program: WebGLProgram"],
  pixelStorei: ["pname: GLenum", "param: GLint | GLboolean"],
  polygonOffset: ["factor: GLfloat", "units: GLfloat"],
  renderbufferStorage: ["target: GLenum", "internalformat: GLenum", "width: GLsizei", "height: GLsizei"],
  sampleCoverage: ["value: GLclampf", "invert: GLboolean"],
  scissor: ["x: GLint", "y: GLint", "width: GLsizei", "height: GLsizei"],
  shaderSource: ["shader: WebGLShader", "source: string"],
  stencilFunc: ["func: GLenum", "ref: GLint", "mask: GLuint"],
  stencilFuncSeparate: ["face: GLenum", "func: GLenum", "ref: GLint", "mask: GLuint"],
  stencilMask: ["mask: GLuint"],
  stencilMaskSeparate: ["face: GLenum", "mask: GLuint"],
  stencilOp: ["fail: GLenum", "zfail: GLenum", "zpass: GLenum"],
  stencilOpSeparate: ["face: GLenum", "fail: GLenum", "zfail: GLenum", "zpass: GLenum"],
  texParameterf: ["target: GLenum", "pname: GLenum", "param: GLfloat"],
  texParameteri: ["target: GLenum", "pname: GLenum", "param: GLint"],
  uniform1f: ["location: WebGLUniformLocation | null", "x: GLfloat"],
  uniform1i: ["location: WebGLUniformLocation | null", "x: GLint"],
  uniform2f: ["location: WebGLUniformLocation | null", "x: GLfloat", "y: GLfloat"],
  uniform2i: ["location: WebGLUniformLocation | null", "x: GLint", "y: GLint"],
  uniform3f: ["location: WebGLUniformLocation | null", "x: GLfloat", "y: GLfloat", "z: GLfloat"],
  uniform3i: ["location: WebGLUniformLocation | null", "x: GLint", "y: GLint", "z: GLint"],
  uniform4f: ["location: WebGLUniformLocation | null", "x: GLfloat", "y: GLfloat", "z: GLfloat", "w: GLfloat"],
  uniform4i: ["location: WebGLUniformLocation | null", "x: GLint", "y: GLint", "z: GLint", "w: GLint"],
  useProgram: ["program: WebGLProgram | null"],
  validateProgram: ["program: WebGLProgram"],
  vertexAttrib1f: ["index: GLuint", "x: GLfloat"],
  vertexAttrib1fv: ["index: GLuint", "values: Float32List"],
  vertexAttrib2f: ["index: GLuint", "x: GLfloat", "y: GLfloat"],
  vertexAttrib2fv: ["index: GLuint", "values: Float32List"],
  vertexAttrib3f: ["index: GLuint", "x: GLfloat", "y: GLfloat", "z: GLfloat"],
  vertexAttrib3fv: ["index: GLuint", "values: Float32List"],
  vertexAttrib4f: ["index: GLuint", "x: GLfloat", "y: GLfloat", "z: GLfloat", "w: GLfloat"],
  vertexAttrib4fv: ["index: GLuint", "values: Float32List"],
  vertexAttribPointer: ["index: GLuint", "size: GLint", "type: GLenum", "normalized: GLboolean", "stride: GLsizei", "offset: GLintptr"],
  viewport: ["x: GLint", "y: GLint", "width: GLsizei", "height: GLsizei"],
};