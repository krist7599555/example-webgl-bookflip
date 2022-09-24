import { Matrix4 } from '@math.gl/core';
import { animationFrames } from 'rxjs';

import { BYTE } from './lib/byte';
import { createProxyGLfromShader } from './lib/proxygl';

const vs = /*glsl*/ `#version 300 es
#pragma vscode_glsllint_stage: vert
layout(location=0) in mat4 a_mvp;
layout(location=4) in vec2 a_position;
layout(location=5) in vec3 a_color;
out vec3 v_color;

void main() {
  gl_PointSize = 50.0;
  v_color = a_color;
  mat4 ar = a_mvp;
  // for (int i = 0; i < 4; ++i) {
  //   for (int j = 0; j < 4; ++j) {
  //     ar[i][j] = 0.0;
  //   }
  //   ar[i][i] = 1.0;
  // }
  gl_Position = ar * vec4(a_position, 0.0, 1.0);
  // gl_Position = vec4(a_position, 0.0, 1.0);
}
` as const;

const fs = /*glsl*/ `#version 300 es
#pragma vscode_glsllint_stage: frag
precision mediump float;
in vec3 v_color;
out vec4 color;
void main() {
  color = vec4(v_color, 1.0);
}
` as const;

export function test_proxygl(canvas: HTMLCanvasElement) {
  canvas.width = 800;
  canvas.height = 800;
  const p = createProxyGLfromShader({
    canvas,
    vertex_shader: vs,
    fragment_shader: fs,
  });
  const gl = p.gl;

  // @ts-ignore
  window['p'] = p;

  /* -------------------------------- SET DATA -------------------------------- */

  const { a_position, a_color, a_mvp } = p.vertext_array.attributes;

  p.array_buffer = gl.createBuffer('MyMainBuffer'); // internaly bind
  p.array_buffer_data = new Float32Array([
    ...[-0.7, -0.5, 1, 0, 0],
    ...[0.6, 0, 0, 1, 0],
    ...[0, 0.7, 0, 0, 1],
  ]);

  a_position.enabled = true;
  a_position.offset = 0;
  a_position.stripe = BYTE.vec2 + BYTE.vec3;

  a_color.enabled = true;
  a_color.offset = BYTE.vec2;
  a_color.stripe = BYTE.vec2 + BYTE.vec3;
  p.array_buffer = null;

  const mvp_buffer = (p.array_buffer = gl.createBuffer());
  const mvp_data = new Float32Array([
    ...new Matrix4().identity().rotateX(Math.PI).translate([-0.3, 0, 0]),
    ...new Matrix4().identity().rotateX(0),
    ...new Matrix4()
      .identity()
      .translate([0.5, 0.5, 0.0])
      .rotateZ(Math.PI * 0.5)
      .scale(0.5),
  ]);
  p.array_buffer_data = {
    data: mvp_data,
    usage: 'DYNAMIC_DRAW',
  };
  a_mvp.enabled = true;
  a_mvp.divisor = 1;
  p.array_buffer = null;

  /* ---------------------------------- DRAW ---------------------------------- */

  animationFrames()
    // .pipe(take(1))
    .subscribe(function ({ timestamp }) {
      gl.clearColor(1, 0.7, 0.8, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      p.array_buffer = mvp_buffer;
      gl.bufferSubData(
        gl.ARRAY_BUFFER,
        BYTE.mat4 * 0,
        new Matrix4()
          .identity()
          .rotateX(timestamp * 0.001)
          .translate([-0.3, 0, 0])
          .toArray(new Float32Array(16))
      );
      gl.bufferSubData(
        gl.ARRAY_BUFFER,
        BYTE.mat4 * 2,
        new Matrix4()
          .identity()
          .translate([Math.sin(timestamp * 0.001) * 0.5, Math.cos(timestamp * 0.001) * 0.5, 0.0])
          .rotateZ(Math.PI * 0.5)
          .scale(0.5 * Math.sin(timestamp * 0.001))
          .toArray(new Float32Array(16))
      );
      p.array_buffer = null;

      p.draw_array_instanced({
        mode: 'TRIANGLES',
        count: 3,
        instance_count: 3,
      });
    });
}
