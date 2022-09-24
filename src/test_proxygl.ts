import { createProxyGLfromShader } from "./lib/proxygl";
import { animationFrames, take } from "rxjs";
import { assert, createProgram, createShader } from "./lib/krgl/helper";
import { WEBGL_TYPE_TABLE } from "./lib/sgl/helper";
import type { Split, Trim } from "type-fest";
import { Matrix3, Matrix4 } from "@math.gl/core";

const vs = /*glsl*/ `#version 300 es
#pragma vscode_glsllint_stage: vert
// layout(location=0) in mat4 a_mvp;
layout(location=4) in vec2 a_position;
layout(location=5) in vec3 a_color;
out vec3 v_color;

void main() {
  gl_PointSize = 50.0;
  v_color = a_color;
  // gl_Position = a_mvp * vec4(a_position, 0.0, 1.0);
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
  const p = createProxyGLfromShader({
    canvas,
    vertex_shader: vs,
    fragment_shader: fs,
  });
  const gl = p.gl;

  // @ts-ignore
  window["p"] = p;

  /* -------------------------------- SET DATA -------------------------------- */

  const { a_position, a_color } = p.vertext_array.attributes;
  const sz_float = WEBGL_TYPE_TABLE.FLOAT.size_byte;

  p.array_buffer = gl.createBuffer("MyMainBuffer"); // internaly bind
  p.array_buffer_data = new Float32Array([
    -0.7, -0.5, 1, 0, 0,
    //
    0.6, 0, 0, 1, 0,
    //
    0, 0.7, 0, 0, 1,
  ]);
  a_position.enabled = true;
  gl.vertexAttrib2f(a_position.location, 0.5, 0);
  a_position.offset = sz_float * 0;
  a_position.stripe = sz_float * 5;

  a_color.enabled = true;
  a_color.offset = sz_float * 2;
  a_color.stripe = sz_float * 5;

  // p.array_buffer = null;

  // p.array_buffer = gl.createBuffer();
  // p.array_buffer_data = new Float32Array([
  //   ...new Matrix4().identity(),
  //   ...new Matrix4().identity(),
  // ]);
  // a_mvp.enabled = true;
  // a_mvp.stripe = sz_float * 4 * 4;
  // a_mvp.offset = sz_float * 0;
  // p.array_buffer = null;

  /* ---------------------------------- DRAW ---------------------------------- */

  animationFrames()
    .pipe(take(1))
    .subscribe(
      ({ timestamp }) => {
        gl.clearColor(1, 0.7, 0.8, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const u_mvp = new Matrix4()
          .identity()
          .translate([0, Math.sin(timestamp * 0.001), 0])
          .rotateZ(timestamp * 0.001)
          .scale(Math.sin(timestamp * 0.001) * 0.3 + 1.0);
        const u_mvp2 = new Matrix4()
          .identity()
          .translate([Math.sin(timestamp * 0.001), 0, 0])
          .rotateZ(timestamp * -0.001)
          .scale(Math.sin(timestamp * 0.001) * 0.3 + 0.5);

        // gl.drawArraysInstanced(gl.TRIANGLES, 0, 3, 2);
        p.draw_array({
          mode: "TRIANGLES",
          count: 3,
        });
      }
      //
    );

  // TODO: try drawArrayInstance
}
