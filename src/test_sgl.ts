import { KrGl, webgl_bind } from "./lib/krgl";
import {
  create_sgl_program,
  sgl_create_vertex_array,
  sgl_enable_vertex_attrib_array,
} from "./lib/sgl/index";
import { sync_pipe } from "ts-async-pipe";
export function test_sgl(canvas: HTMLCanvasElement) {
  const [W, H] = [800, 800] as const;
  canvas.width = W;
  canvas.height = H;
  const sgl = create_sgl_program({
    canvas: canvas,
    vertext_shader: /*glsl*/ `#version 300 es
      #pragma vscode_glsllint_stage: vert
      in vec2 a_position;
      in mat4 a_mvp;
      uniform float u_f;
      uniform bool u_b;
      uniform int u_i;
      uniform mat4 u_mvp;
      uniform mat4[6] u_mvps;
      uniform mat4[1] u_mvp1;
      void main() {
        gl_PointSize = u_b ? u_f : float(u_i);
        gl_Position = u_mvp * u_mvp1[0] * u_mvps[3] * a_mvp * vec4(a_position, 0.0, 1.0);
      }
    ` as const,
    fragment_shader: /*glsl*/ `#version 300 es
      #pragma vscode_glsllint_stage: frag
      precision mediump float;
      out vec4 color;
      void main() {
        color = vec4(1.0, 0.0, 0.0, 1.0);
      }
    ` as const,
  });

  sync_pipe(
    sgl,
    (o) => sgl_create_vertex_array(o),
    (o) => sgl_enable_vertex_attrib_array(o, "a_mvp"),
    (o) => {
      console.log(o.state.attributes.a_mvp);
    }
  );
}
