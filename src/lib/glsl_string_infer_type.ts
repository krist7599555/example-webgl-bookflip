/* eslint-disable unused-imports/no-unused-vars */

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

type InferAttributeRecursive<T extends string> =
  T extends `${string}in ${infer Typ} ${infer Var};${infer Tail}`
    ?
        | InferAttributeRecursive<Tail>
        | (Var extends `${string} ${string}`
            ? never
            : Typ extends keyof Minitype
            ? { type: Minitype[Typ]; size: 1; name: Var }
            : Typ extends `${infer TT extends keyof Minitype}[${infer SZ extends number}]`
            ? { type: Minitype[TT]; size: SZ; name: Var }
            : never)
    : never;

type InferUniformRecursive<T extends string> =
  T extends `${string}uniform ${infer Typ} ${infer Var};${infer Tail}`
    ?
        | InferUniformRecursive<Tail>
        | (Var extends `${string} ${string}`
            ? never
            : Typ extends keyof Minitype
            ? { type: Minitype[Typ]; size: 1; name: Var }
            : Typ extends `${infer TT extends keyof Minitype}[${infer SZ extends number}]`
            ? { type: Minitype[TT]; size: SZ; name: Var }
            : never)
    : never;

export type InferAttribute<T extends string> = {
  [attr_info in InferAttributeRecursive<T> as attr_info['name']]: attr_info;
};

export type InferUniform<T extends string> = {
  [attr_info in InferUniformRecursive<T> as attr_info['name']]: attr_info;
};

type _TEST_U1 = InferUniform<'uniform sampler2D u_texture;'>;
type _TEST_U2 = InferUniform<'uniform sampler2DArray u_textures;'>;
type _TEST_U3 = InferUniform<'uniform int u_texture_index;'>;
type _TEST_A1 = InferAttribute<'in vec3 u_texture; '>;
type _TEST_A2 = InferAttribute<' layout(location=6) in mat4 u_textures;'>;
type _TEST_A3 = InferAttribute<'in int[5] u_texture_index;'>;
type _TEST_C = InferAttribute<`#version 300 es
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
}`>;
