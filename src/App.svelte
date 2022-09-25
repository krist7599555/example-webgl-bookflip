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

  // @ts-expect-error
  window['gl'] = gl;
  pgl.inspect = true;

  pgl.array_buffer = gl.createBuffer();
  pgl.array_buffer_data = {
    data: new Float32Array([-0.5, -0.2, 0.7, -0.5, 0.6, 0.4, -0.5, 0.7]),
    usage: 'DYNAMIC_DRAW',
  };
  pgl.vertext_array.attributes.a_position.enabled = true;

  pgl.vertext_array.element_array_buffer = gl.createBuffer();
  pgl.vertext_array.element_array_buffer_data = {
    data: new Uint16Array([0, 1, 2, 2, 3, 0]),
  };

  gl.clearColor(0.6, 0.8, 0.85, 1);

  animationFrames().subscribe(({ timestamp: _t }) => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    pgl.draw_element({
      mode: 'TRIANGLES',
      count: 6,
    });

    pgl.inspect = false;
  });
});
</script>

<canvas style="max-width: 100vw; max-height: 100vh;" bind:this={canvas} />
