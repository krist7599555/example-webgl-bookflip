<script lang="ts">
import { onMount } from 'svelte';

import { BYTE } from './lib/byte';
import { createProxyGLfromShader } from './lib/proxygl';

let canvas: HTMLCanvasElement;

async function load_image(src: string): Promise<HTMLImageElement> {
  const m = document.createElement('img');
  return new Promise(resolve => {
    m.src = src;
    m.onload = () => resolve(m);
  });
}

onMount(async () => {
  canvas.width = 800;
  canvas.height = 800;
  const pgl = createProxyGLfromShader({
    canvas,
    vertex_shader: /*glsl*/ `#version 300 es
      #pragma vscode_glsllint_stage: vert
      in vec2 a_position;
      in vec2 a_uv;
      out vec2 v_uv;
      void main() {
        gl_PointSize = 50.0;
        v_uv = a_uv;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }`,
    fragment_shader: /*glsl*/ `#version 300 es
      #pragma vscode_glsllint_stage: frag
      precision mediump float;
      uniform sampler2D u_texture;
      in vec2 v_uv;
      out vec4 o_color;
      void main() {
        o_color = texture(u_texture, v_uv);
      }`,
  });

  const gl = pgl.gl;
  pgl.inspect = true;
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(pgl.uniforms.u_texture.location, 0);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    // 2,
    // 2,
    // 0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new ImageData(
      new Uint8ClampedArray([
        255, 155, 100, 255, 55, 155, 100, 255, 0, 0, 100, 255, 100, 0, 100, 255,
      ]),
      2,
      2
    )
    // await load_image('texture-1.png')
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.GL_NEAREST_MIPMAP_LINEAR);

  // pgl.uniforms.
  // @ts-expect-error
  window['gl'] = gl;
  pgl.inspect = false;

  {
    const { a_position, a_uv } = pgl.vertext_array.attributes;

    pgl.array_buffer = gl.createBuffer();
    pgl.array_buffer_.data({
      data: new Float32Array([
        ...[-0.5, -0.2, 0, 0],
        ...[0.7, -0.5, 0, 1],
        ...[0.6, 0.4, 1, 1],
        ...[-0.5, 0.7, 1, 0],
      ]),
    });
    a_position.enabled = true;
    a_position.offset = 0;
    a_position.stripe = BYTE.vec2 + BYTE.vec2;

    a_uv.enabled = true;
    a_uv.offset = BYTE.vec2;
    a_uv.stripe = BYTE.vec2 + BYTE.vec2;
    pgl.array_buffer = null;
  }

  {
    pgl.vertext_array.element_array_buffer = gl.createBuffer();
    pgl.vertext_array.element_array_buffer_.data({
      data: new Uint16Array([0, 1, 2, 2, 3, 0]),
    });
  }

  gl.clearColor(0.6, 0.8, 0.85, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  pgl.draw_element({
    mode: 'TRIANGLES',
    count: 6,
  });
  // animationFrames().subscribe(({ timestamp: _t }) => {

  //   pgl.inspect = false;
  // });
});
</script>

<canvas style="max-width: 100vw; max-height: 100vh;" bind:this={canvas} />
