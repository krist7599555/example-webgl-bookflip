import { createProxy } from "./lib/proxygl";
import { assert, createProgram, createShader } from "./lib/krgl/helper";
import { WEBGL_TYPE_TABLE } from "./lib/sgl/helper";

const vs = /*glsl*/ `#version 300 es
#pragma vscode_glsllint_stage: vert
in vec2 a_position;
in vec3 a_color;
out vec3 v_color;
void main() {
  gl_PointSize = 50.0;
  v_color = a_color;
  gl_Position = vec4(a_position, 0.0, 1.0);
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
  const gl = canvas.getContext("webgl2")!;
  const program = createProgram(
    gl,
    createShader(gl, gl.VERTEX_SHADER, vs.trim())!,
    createShader(gl, gl.FRAGMENT_SHADER, fs.trim())!
  )!;
  // https://github.com/EricEisaman/webgl2-lessons/blob/master/webgl-attributes.md
  console.log("test_proxygl");
  gl.useProgram(program);
  const p = createProxy<{
    attributes: {
      a_position: {
        size: 1;
        type: "FLOAT_VEC2";
      };
      a_color: {
        size: 1;
        type: "FLOAT_VEC3";
      };
    };
    uniforms: {};
  }>(gl, program);
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

  /* ---------------------------------- DRAW ---------------------------------- */

  gl.clearColor(1, 0.7, 0.8, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  p.draw_array({
    mode: "TRIANGLES",
    count: 3,
  });
}
