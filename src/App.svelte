<script lang="ts">
import { animationFrames } from 'rxjs';
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
async function scale_image(
  image: HTMLImageElement | ImageBitmap | ImageData | Blob,
  width: number,
  height: number
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const pure_image =
    image instanceof ImageData || image instanceof Blob ? await createImageBitmap(image) : image;
  ctx.drawImage(pure_image, 0, 0, width, height);
  document.body.append(canvas);
  canvas.style.minWidth = '30vw';
  canvas.style.minHeight = '30vh';
  return canvas;
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
      precision mediump sampler2DArray;

      uniform sampler2DArray u_textures;
      uniform int u_texture_index;
      in vec2 v_uv;
      out vec4 o_color;
      void main() {
        o_color = texture(u_textures, vec3(v_uv, u_texture_index));
      }`,
  });

  const img1 = new ImageData(
    new Uint8ClampedArray([
      255, 155, 100, 255, 55, 155, 100, 255, 0, 0, 100, 255, 100, 0, 100, 255,
    ]),
    2,
    2
  );
  const img3 = new ImageData(
    new Uint8ClampedArray([0, 0, 0, 255, 255, 0, 0, 255, 0, 0, 0, 255, 100, 0, 0, 255]),
    2,
    2
  );
  const img2 = new ImageData(
    new Uint8ClampedArray([255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 0, 255, 100, 0, 0, 255]),
    2,
    2
  );
  const img4 = await load_image('texture-4.png');

  const gl = pgl.gl;
  pgl.inspect = true;

  gl.TEXTURE_2D_ARRAY;
  const TEXTURE_IMG1_IDX = 1;

  const sz = 2;

  pgl.texture_active_index = TEXTURE_IMG1_IDX;
  pgl.texture_2d_array = gl.createTexture();
  pgl.texture_2d_array_
    .minmag('NEAREST')
    .tex_storage_3D_builder(sz, sz, 4)
    .set_texture(0, await scale_image(img1, sz, sz))
    .set_texture(1, await scale_image(img2, sz, sz))
    .set_texture(2, await scale_image(img3, sz, sz))
    .set_texture(3, await scale_image(img4, sz, sz));

  pgl.uniforms.u_textures.data = [TEXTURE_IMG1_IDX];

  // @ts-expect-error
  window['gl'] = gl;
  pgl.inspect = false;

  {
    const { a_position, a_uv } = pgl.vertext_array.attributes;

    pgl.array_buffer_.bind(gl.createBuffer()).data({
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
  animationFrames().subscribe(({ timestamp: t }) => {
    pgl.uniforms.u_texture_index.data = [Math.round(t * 0.005) % 4];
    pgl.draw_element({
      mode: 'TRIANGLES',
      count: 6,
    });
    // pgl.inspect = false;
  });
});
</script>

<canvas style="max-width: 100vw; max-height: 100vh;" bind:this={canvas} />
