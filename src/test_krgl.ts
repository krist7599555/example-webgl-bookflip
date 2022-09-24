import { KrGl, webgl_bind } from './lib/krgl';

export function test_krgl(canvas: HTMLCanvasElement) {
  const [W, H] = [800, 800] as const;
  canvas.width = W;
  canvas.height = H;
  const krgl = KrGl.create({
    canvas: canvas,
    vertext_shader: /*glsl*/ `#version 300 es
      #pragma vscode_glsllint_stage: vert
      in vec2 a_position;
      void main() {
        gl_PointSize = 10.0;
        gl_Position = vec4(a_position, 0.0, 1.0);
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
  const vao = krgl.create_vao_state();
  const buffer = krgl
    .create_buffer('ARRAY_BUFFER')
    .data(new Float32Array([-0.7, 0, 0.6, 0, 0, 0.7]));

  webgl_bind(
    {
      vao: vao,
      array_buffer: buffer,
    },
    () => {
      krgl
        .attribute_location('a_position', 'vec2')
        .enable_attr_array()
        .set_attr_to_active_array_buffer({
          offset: 0,
        });
      krgl.gl.drawArrays(krgl.gl.TRIANGLES, 0, 3);
    }
  );
}
