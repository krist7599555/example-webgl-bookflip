import { createProxyGLfromShader } from "./lib/proxygl";
import { animationFrames } from "rxjs";
import { assert, createProgram, createShader } from "./lib/krgl/helper";
import { WEBGL_TYPE_TABLE } from "./lib/sgl/helper";
import type { Split, Trim } from "type-fest";

const vs = /*glsl*/ `#version 305 es
#pragma vscode_glsllint_stage: vert
layout(location=0) in vec2 a_position;
in vec3 a_color;
in vec3[2] a_colorx;
out vec3 v_color;
uniform float u_scale;
uniform vec2 u_translate;

void main() {
  gl_PointSize = 50.0;
  v_color = a_color;
  gl_Position = vec4(a_position * u_scale + u_translate, 0.0, 1.0);
}
` as const;

const fs = /*glsl*/ `#version 300 es
#pragma vscode_glsllint_stage: frag
precision mediump float;
uniform float u_color_opacity;
in vec3 v_color;
out vec4 color;
void main() {
  color = vec4(v_color, u_color_opacity);
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
  window["p"] = p;

  /* -------------------------------- SET DATA -------------------------------- */

  p.array_buffer = gl.createBuffer(); // internaly bind
  // prettier-ignore
  p.array_buffer_data = new Float32Array([
    -0.7, -0.5,   1, 0, 0,
    0.6, 0,       0, 1, 0,
    0, 0.7,       0, 0, 1,
  ]);

  const { a_position, a_color } = p.vertext_array.attributes;
  const sz_float = WEBGL_TYPE_TABLE.FLOAT.size_byte;

  a_position.enabled = true;
  a_position.offset = sz_float * 0;
  a_position.stripe = sz_float * 5;

  a_color.enabled = true;
  a_color.offset = sz_float * 2;
  a_color.stripe = sz_float * 5;

  p.array_buffer = null;

  p.uniforms.u_scale.data = [0.5];

  /* ---------------------------------- DRAW ---------------------------------- */

  gl.clearColor(1, 0.7, 0.8, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  animationFrames().subscribe(({ timestamp }) => {
    p.uniforms.u_scale.data = [Math.sin(timestamp * 0.001)];
    p.draw_array({
      mode: "TRIANGLES",
      count: 3,
    });
  });

  // TODO: try drawArrayInstance
}
