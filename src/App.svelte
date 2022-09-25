<script lang="ts">
import { animationFrames } from 'rxjs';
import { onMount } from 'svelte';

import { createProxyGLfromShader } from './lib/proxygl';

let canvas: HTMLCanvasElement;

onMount(() => {
  canvas.width = 800;
  canvas.height = 800;
  const pgl = createProxyGLfromShader({
    canvas,
    vertex_shader: /*glsl*/ `#version 300 es
      #pragma vscode_glsllint_stage: vert
      in vec2 a_position;
      in vec3 a_color;
      in vec2 a_translate;
      out vec3 v_color;
      void main() {
        gl_PointSize = 50.0;
        v_color = a_color;
        gl_Position = vec4(a_position + a_translate, 0.0, 1.0);
      }`,
    fragment_shader: /*glsl*/ `#version 300 es
      #pragma vscode_glsllint_stage: frag
      precision mediump float;
      in vec3 v_color;
      out vec4 o_color;
      void main() {
        o_color = vec4(v_color, 1.0);
      }`,
  });
  const gl = pgl.gl;

  // @ts-expect-error
  window['gl'] = gl;
  pgl.inspect = true;

  const { a_color, a_translate, a_position } = pgl.vertext_array.attributes;

  pgl.array_buffer = gl.createBuffer();
  pgl.array_buffer_.data({
    data: new Float32Array([-0.5, -0.2, 0.7, -0.5, 0.6, 0.4, -0.5, 0.7]),
    usage: 'DYNAMIC_DRAW',
  });
  a_position.enabled = true;

  pgl.vertext_array.element_array_buffer = gl.createBuffer();
  pgl.vertext_array.element_array_buffer_.data({
    data: new Uint16Array([0, 1, 2, 2, 3, 0]),
  });
  pgl.array_buffer = null;

  pgl.array_buffer = gl.createBuffer()!;
  pgl.array_buffer_.data({
    data: new Float32Array([1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0]),
  });
  a_color.enabled = true;

  a_translate.enabled = false;

  pgl.array_buffer = gl.createBuffer()!;
  pgl.array_buffer_.data({
    data: new Float32Array([0.0, 0.5, -0.5, 0, 0.5, 0, 0.0, -0.5]),
  });
  a_translate.divisor = 1;
  a_translate.enabled = true;
  pgl.array_buffer = null;

  gl.clearColor(0.6, 0.8, 0.85, 1);
  animationFrames().subscribe(({ timestamp: _t }) => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    pgl.draw_element_instanced({
      mode: 'TRIANGLES',
      count: 6,
      instance_count: 4,
    });

    pgl.inspect = false;
  });
});
</script>

<canvas style="max-width: 100vw; max-height: 100vh;" bind:this={canvas} />
