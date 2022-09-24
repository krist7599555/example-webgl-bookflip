import type { Split, Trim, ValueOf } from 'type-fest';

import { TYPECONVERT } from './constant';

/**
 * @see {satisfies} keyword available on typescript 4.9 only
 * {@link https://dlguswo333.github.io/programming/2022/03/26/ts-satisfies-keyword.html}
 **/

type Layout<N extends number> = `layout(location=${N})`;
type VarQualifierGlslString = 'in' | 'uniform';
type VarQualifier<P extends VarQualifierGlslString> = P extends 'uniform' ? 'uniform' : 'attribute';
type VarDataTypeBase = ValueOf<typeof TYPECONVERT>['glsl_type'];
type VarDataType<ArrSize extends number | null = number | null> = ArrSize extends number
  ? `${VarDataTypeBase}[${ArrSize}]`
  : VarDataTypeBase;
type InferVarDataTypeArrayLength<T extends `${VarDataTypeBase}` | `${VarDataTypeBase}[${number}]`> =
  T extends `${VarDataTypeBase}[${infer N extends number}]` ? N : 1;
type VarDataType2VarDataTypeBase<T extends VarDataType> = T extends `${infer F}[${number}]` ? F : T;

type VarName<Var extends string = string> = `${Var};`;
type SplitLine<T extends string> = Trim<Split<T, '\n'>[number]>;

export const GL_TYPE2MINIMAL = {
  FLOAT_MAT4: 'mat4',
  FLOAT_MAT3: 'mat3',
  FLOAT_MAT2: 'mat2',
  FLOAT_VEC4: 'vec4',
  FLOAT_VEC3: 'vec3',
  FLOAT_VEC2: 'vec2',
  BOOL: 'bool',
  INT: 'int',
  FLOAT: 'float',
} as const;
export const GL_MINIMAL2TYPE = {
  mat4: 'FLOAT_MAT4',
  mat3: 'FLOAT_MAT3',
  mat2: 'FLOAT_MAT2',
  vec4: 'FLOAT_VEC4',
  vec3: 'FLOAT_VEC3',
  vec2: 'FLOAT_VEC2',
  bool: 'BOOL',
  int: 'INT',
  float: 'FLOAT',
} as const;

export type DefaultGlslSingleInfo = {
  layout?: Layout<number>;
  layout_location?: number;
  variable_qualifier: 'uniform' | 'attribute';
  data_type: VarDataTypeBase;
  variable_name: string;
};

export type InferSglType<T extends string> = Split<T, ' '> extends [
  infer Lay extends Layout<number>,
  infer Pos extends VarQualifierGlslString,
  infer Typ extends VarDataType,
  infer Var extends VarName
]
  ? {
      $$type_glsl_layout: Lay;
      $$type_glsl_qualifier: VarQualifier<Pos>;
      $$type_glsl_data_type: Typ;
      size: InferVarDataTypeArrayLength<Typ>;
      name: Var extends VarName<infer V> ? V : never;
      type: typeof GL_MINIMAL2TYPE[VarDataType2VarDataTypeBase<Typ>];
    }
  : Split<T, ' '> extends [
      infer Pos extends VarQualifierGlslString,
      infer Typ extends VarDataType,
      infer Var extends VarName
    ]
  ? {
      // $$type_glsl_layout: null;
      $$type_glsl_qualifier: VarQualifier<Pos>;
      // $$type_glsl_data_type: Typ;
      size: InferVarDataTypeArrayLength<Typ>;
      name: Var extends VarName<infer V> ? V : never;
      type: typeof GL_MINIMAL2TYPE[VarDataType2VarDataTypeBase<Typ>];
    }
  : never;
type _TEST_InferSglType1 = InferSglType<'uniform mat4[6] u_mvps;'>;
export type InferSglTypes<T extends string> = {
  [k in SplitLine<T> as InferSglType<k>['name']]: InferSglType<k>;
};
export type InferSglTypesArray<T extends string> = InferGlslLine<SplitLine<T>>;

export type InferGlslLine<T extends string> = Split<T, ' '> extends [
  infer Lay extends Layout<number>,
  infer Pos extends VarQualifierGlslString,
  infer Typ extends VarDataType,
  infer Var extends VarName
]
  ? {
      layout: Lay;
      layout_location: Lay extends Layout<infer I> ? I : null;
      variable_qualifier: VarQualifier<Pos>;
      data_type: Typ;
      variable_name: Var extends VarName<infer V> ? V : never;
    }
  : Split<T, ' '> extends [
      infer Pos extends VarQualifierGlslString,
      infer Typ extends VarDataType,
      infer Var extends VarName
    ]
  ? {
      variable_qualifier: VarQualifier<Pos>;
      data_type: Typ;
      variable_name: Var extends VarName<infer V> ? V : never;
    }
  : {
      variable_qualifier: 'uniform' | 'attribute';
      data_type: VarDataTypeBase;
      variable_name: string;
    };

export type InferGlslLines<T extends string> = {
  [k in SplitLine<T> as InferGlslLine<k>['variable_name']]: InferGlslLine<k>;
};

type _TEST_C1 = InferGlslLine<'layout(location=1) in vec2 a_position;'>;
type _TEST_C2 = InferGlslLine<'in mat4 a_position2;'>;
type _TEST_C4 = InferGlslLine<'uniform mat4 a_position3;'>;
type _TEST_C5 = InferGlslLine<'layout(location=3) uniform mat4 a_position4;'>;
type _TEST_C6 = InferGlslLines<
  'layout(location=1) in vec2 a_position;' | 'in mat4 a_position2;' | 'uniform mat4 a_position3;'
>;
type _TEST_C7 = InferSglTypesArray<
  'layout(location=1) in vec2 a_position;' | 'in mat4 a_position2;' | 'uniform mat4 a_position3;'
>;
type _TEST_E1 = InferGlslLines<`#version 304 es
    #pragma vscode_glsllint_stage: vert
    layout(location=1) in vec2 a_position;
    in vec2 a_colors;
    uniform mat4 u_mvp;
    layout(location=3) uniform mat4 u_opacity;
    void main() {
      gl_PointSize = 10.0;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `>;
