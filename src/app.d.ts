interface WebGLBuffer {
  debug_id?: string;
}

interface WebGLRenderingContextBase {
  createBuffer(debug_id: string): WebGLBuffer | null;
}
