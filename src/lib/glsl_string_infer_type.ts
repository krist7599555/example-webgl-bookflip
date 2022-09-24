/* eslint-disable unused-imports/no-unused-vars */
import type { Split, Trim } from 'type-fest';

type Minitype = {
  float: 'FLOAT';
  vec2: 'FLOAT_VEC2';
  vec3: 'FLOAT_VEC3';
  vec4: 'FLOAT_VEC4';
  mat2: 'FLOAT_MAT2';
  mat3: 'FLOAT_MAT3';
  mat4: 'FLOAT_MAT4';
  bool: 'BOOL';
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
