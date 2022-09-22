import { createProxy } from "./lib/proxygl";
import { assert, createProgram, createShader } from "./lib/krgl/helper";

const vs = /*glsl*/ `#version 300 es
#pragma vscode_glsllint_stage: vert
in vec2 a_position;
void main() {
  gl_PointSize = 50.0;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
` as const;
const fs = /*glsl*/ `#version 300 es
#pragma vscode_glsllint_stage: frag
precision mediump float;
out vec4 color;
void main() {
  color = vec4(1.0, 0.0, 0.0, 1.0);
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
    };
    uniforms: {};
  }>(gl, program);
  // @ts-ignore
  window["p"] = p;
  // p.vertext_array.attributes.a_position.enabled = false;
  // gl.vertexAttrib2f(p.vertext_array.attributes.a_position.location, -0.5, -0.3);

  p.array_buffer = gl.createBuffer(); // internaly bind
  p.array_buffer_data = new Float32Array([-0.7, -0.5, 0.6, 0, 0, 0.7]);

  p.vertext_array.attributes.a_position.enabled = true;
  p.vertext_array.attributes.a_position.update_vertex_attrib_pointer();

  console.log("HELLO");
  gl.clearColor(1, 0.7, 0.8, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  p.draw_array({
    mode: "TRIANGLES",
    count: 3,
  });
}
