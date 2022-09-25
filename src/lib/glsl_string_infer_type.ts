/* eslint-disable unused-imports/no-unused-vars */
import type { Split, Trim } from 'type-fest';

type Minitype = {
  int: 'INT';
  float: 'FLOAT';
  vec2: 'FLOAT_VEC2';
  vec3: 'FLOAT_VEC3';
  vec4: 'FLOAT_VEC4';
  mat2: 'FLOAT_MAT2';
  mat3: 'FLOAT_MAT3';
  mat4: 'FLOAT_MAT4';
  bool: 'BOOL';
  sampler2D: 'SAMPLER_2D';
  sampler2DArray: 'SAMPLER_2D_ARRAY';
};

type InferAttributeLine<T extends string> = T extends `${
  | ''
  | `layout(${string}) `}in ${infer T extends `${keyof Minitype}${string}`} ${infer V};`
  ? {
      size: T extends `${keyof Minitype}[${infer SZ extends number}]` ? SZ : 1;
      type: Split<T, '['>[0] extends keyof Minitype ? Minitype[Split<T, '['>[0]] : never;
      name: V;
    }
  : never;

type InferUniformLine<T extends string> =
  T extends `uniform ${infer T extends `${keyof Minitype}${string}`} ${infer V};`
    ? {
        size: T extends `${keyof Minitype}[${infer SZ extends number}]` ? SZ : 1;
        type: Split<T, '['>[0] extends keyof Minitype ? Minitype[Split<T, '['>[0]] : never;
        name: V;
      }
    : never;

export type InferAttribute<T extends string> = {
  [key in Trim<Split<T, '\n'>[number]> as InferAttributeLine<key>['name']]: InferAttributeLine<key>;
};
export type InferUniform<T extends string> = {
  [key in Trim<Split<T, '\n'>[number]> as InferUniformLine<key>['name']]: InferUniformLine<key>;
};

type _TEST_TEXTURE_A0 = InferUniformLine<'uniform sampler2D u_texture;'>;
type _TEST_TEXTURE_A3 = InferUniformLine<'uniform sampler2DArray u_textures;'>;
type _TEST_TEXTURE_A5 = InferUniformLine<'uniform int u_texture_index;'>;
type _TEST_TEXTURE_A1 = InferUniform</*glsl*/ `#version 300 es
#pragma vscode_glsllint_stage: frag
precision mediump float;
uniform sampler2D u_texture;
in vec2 v_uv;
out vec4 o_color;
void main() {
  o_color = texture(u_texture, v_uv);
}`>;
type _TEST_TEXTURE_A4 = InferUniform</*glsl*/ `precision mediump float;
precision mediump sampler2DArray;

uniform sampler2DArray u_textures;
uniform int u_texture_index;
in vec2 v_uv;`>;
