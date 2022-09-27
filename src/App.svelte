<script lang="ts">
import { Matrix4 } from '@math.gl/core';
import { range } from 'lodash-es';
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

function gen_paper_mesh(w: number, h: number) {
  const verties = range(h + 1).flatMap(i => range(w + 1).flatMap(j => [i / h, j / w]));
  const indices = range(h).flatMap(i =>
    range(w).flatMap(j => {
      const idx = i * (w + 1) + j;
      return [idx, idx + 1, idx + h + 1, idx + 1, idx + h + 1, idx + h + 2];
    })
  );
  return { verties, indices };
}

const VERTEX_SHADER = /*glsl*/ `#version 300 es
  #pragma vscode_glsllint_stage: vert
  in vec2 a_position;
  in vec2 a_uv;
  uniform mat4 u_mvp;
  uniform float u_timestamp;
  out vec2 v_uv;
  out vec3 v_color;

  vec3 projection(in vec3 point, in vec3 line) {
    return (dot(point, line) / dot(line, line)) * line;
  }
  bool float_eq(float a, float b) {
    return abs(a - b) < 0.001;
  }
  bool is_same_plane(vec3 a, vec3 b, vec3 c) {
    return float_eq(dot(a, cross(b, c)), 0.0);
  }
  float angle(vec3 a, vec3 b) {
    return acos(dot(a, b) / (length(a) * length(b)));
  }
  bool is_between(vec2 center, vec2 lhs, vec2 rhs) {
    // assume is_same_plane
    vec3 c = vec3(center, 0.0);
    vec3 l = vec3(lhs, 0.0);
    vec3 r = vec3(rhs, 0.0);
    return dot(cross(c, l), cross(c, r)) < 0.0;
  }

  const float PI = 3.141;
  const float R = 0.01;
  const vec3 ONE = vec3(1.0, 1.0, 1.0);
  
  void main() {
    gl_PointSize = 50.0;
    v_uv = a_uv;

    float t2 = u_timestamp * 0.0005;
    vec3 pos = vec3(a_position + vec2(0.1, 0.1), 0.0);
    vec3 roll = vec3(abs(sin(t2)), abs(cos(t2)), 0.0);
    vec3 spine = vec3(0.0, -1.0, 0.0);
    vec3 proj_roll = projection(pos, roll);
    float dist_from_roll = distance(pos, proj_roll);
    // hack test
    // dist_from_roll = min(dist_from_roll, PI * R);
    v_color = vec3(0.5, 0.5, 0.5);
    vec3 o_output = vec3(0.0, 0.0, 0.0);
    if (is_between(pos.xy, roll.xy, spine.xy)) {
      dist_from_roll = 0.0;
      v_color = vec3(0.5, 1.0, 0.5);
      o_output = pos;
    }
    if (0.0 < dist_from_roll) {
      float rem = min(dist_from_roll, PI * R);
      float progress = rem / (PI * R);
      v_color = vec3(0.5, 0.5, 1.0);
      vec3 dest = proj_roll - vec3(0.0, 0.0, 0.0 * R) * progress;
      o_output = dest;
      dist_from_roll -= rem;
    }
    if (0.0 < dist_from_roll) {
      vec3 dest = proj_roll;
      dest.z -= 2.0 * R;
      dest += normalize(proj_roll - pos) * dist_from_roll;
      v_color = vec3(1.0, 0.5, 0.5);
      o_output = dest;
    }
    gl_Position = u_mvp * vec4(o_output, 1.0);
  }`;
const FRAGMENT_SHADER = /*glsl*/ `#version 300 es
  #pragma vscode_glsllint_stage: frag
  precision mediump float;
  precision mediump sampler2DArray;

  uniform sampler2DArray u_textures;
  uniform int u_texture_index;
  in vec2 v_uv;
  in vec3 v_color;
  out vec4 o_color;
  void main() {
    o_color = vec4(v_color, 1.0) * texture(u_textures, vec3(v_uv, u_texture_index));
  }`;

onMount(async () => {
  canvas.width = 800;
  canvas.height = 800;
  const pgl = createProxyGLfromShader({
    canvas,
    vertex_shader: VERTEX_SHADER,
    fragment_shader: FRAGMENT_SHADER,
  });
  const img1 = await load_image('texture-1.png');
  const img2 = await load_image('texture-2.png');
  const img3 = await load_image('texture-3.png');

  const gl = pgl.gl;
  pgl.inspect = true;

  gl.TEXTURE_2D_ARRAY;
  const TEXTURE_IMG1_IDX = 1;

  const sz = 300;

  pgl.texture_active_index = TEXTURE_IMG1_IDX;
  pgl.texture_2d_array = gl.createTexture();
  pgl.texture_2d_array_
    .minmag('LINEAR')
    .tex_storage_3D_builder(sz, sz, 3)
    .set_texture(0, await scale_image(img1, sz, sz))
    .set_texture(1, await scale_image(img2, sz, sz))
    .set_texture(2, await scale_image(img3, sz, sz));

  pgl.uniforms.u_textures.data = [TEXTURE_IMG1_IDX];

  // @ts-expect-error
  window['gl'] = gl;
  pgl.inspect = true;

  const paper = gen_paper_mesh(100, 100);
  {
    const { a_position, a_uv } = pgl.vertext_array.attributes;

    pgl.array_buffer_.bind(gl.createBuffer()).data({
      data: new Float32Array(paper.verties),
    });

    a_position.enabled = true;
    a_position.offset = 0;
    a_position.stripe = BYTE.vec2;

    a_uv.enabled = true;
    a_uv.offset = 0;
    a_uv.stripe = BYTE.vec2;
    pgl.array_buffer = null;
  }

  {
    pgl.vertext_array.element_array_buffer = gl.createBuffer();
    pgl.vertext_array.element_array_buffer_.data({
      data: new Uint16Array(paper.indices),
    });
  }

  gl.clearColor(0.6, 0.8, 0.85, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  animationFrames().subscribe(({ timestamp: t }) => {
    // pgl.uniforms.u_texture_index.data = [Math.round(t * 0.005) % 3];
    pgl.uniforms.u_timestamp.data = [t];
    const u_mvp = new Matrix4()
      .multiplyLeft(
        new Matrix4()
          .rotateZ(Math.PI * 0.5)
          .scale(2)
          .translate([-0.5, -0.5, 0])
      )
      .multiplyLeft(
        new Matrix4().lookAt({
          eye: [0, -3, -3],
        })
      )
      .multiplyLeft(new Matrix4().perspective({ fovy: (45 * Math.PI) / 180 }));
    // console.log(u_mvp);
    pgl.uniforms.u_mvp.data = u_mvp;
    pgl.draw_element({
      mode: 'TRIANGLES',
      count: paper.indices.length,
    });
    pgl.inspect = false;
  });
});
</script>

<canvas style="max-width: 100vw; max-height: 100vh;" bind:this={canvas} />
