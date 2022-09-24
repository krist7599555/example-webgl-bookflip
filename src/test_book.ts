import { animationFrames } from 'rxjs';

import { createProxyGLfromShader } from './lib/proxygl';

export function test_book(canvas: HTMLCanvasElement) {
  canvas.width = 800;
  canvas.height = 800;
  const pgl = createProxyGLfromShader({
    canvas,
    vertex_shader: /*glsl*/ `#version 300 es
      #pragma vscode_glsllint_stage: vert
      in vec2 a_position;
      void main() {
        gl_PointSize = 50.0;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }`,
    fragment_shader: /*glsl*/ `#version 300 es
      #pragma vscode_glsllint_stage: frag
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(0.9, 0.5, 0.2, 1.0);
      }`,
  });
  const gl = pgl.gl;
  pgl.inspect = true;

  pgl.array_buffer = gl.createBuffer();
  pgl.array_buffer_data = {
    data: new Float32Array([-0.5, 0, 0.7, 0.5, 0.6, -0.3]),
    usage: 'DYNAMIC_DRAW',
  };
  pgl.vertext_array.attributes.a_position.enabled = true;

  // @ts-expect-error
  window['gl'] = gl;
  gl.clearColor(0.6, 0.8, 0.85, 1);
  animationFrames().subscribe(({ timestamp }) => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array([Math.sin(timestamp * 0.001)]));
    pgl.draw_array({ mode: 'TRIANGLES', count: 3 });
    pgl.inspect = false;
  });
}
