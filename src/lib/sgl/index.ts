import { keyBy, mapValues, range } from 'lodash-es';
import { default as merge } from 'ts-deepmerge';
import type { ConditionalPick, Simplify } from 'type-fest';

import { createProgram, createShader } from '../krgl/helper';
import type { InferSglTypes } from '../krgl/type_helper';
import { tf_merge } from '../type-fest-runtime';
import { gl_parameter_name } from './helper';

type Dictionary<V> = { [key in any]: V };

type SglState = {
  _webgl_ref_array_buffer: any | null;
  _webgl_ref_element_array_buffer: any | null;
  _webgl_ref_vao: WebGLVertexArrayObject | null;

  attributes: Dictionary<{
    size?: number;
    name: string;
    type?: string;
    location?: number;
    enabled: boolean;
    normalize?: boolean;
    stripe?: number;
    offset?: number;
    buffer?: any;
    default_value?: any;
  }>;
  active_uniforms: Dictionary<{
    location: number;
    name: string;
    size: number;
    type: string;
  }>;
  active_attributes: Dictionary<{
    location: number;
    name: string;
    size: number;
    type: string;
  }>;
};

interface SglProgram<State extends SglState> {
  readonly gl: WebGL2RenderingContext;
  readonly program: WebGLProgram;
  readonly state: State;
}

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

export function create_sgl_program<VS extends string, FS extends string>(opt: {
  canvas: HTMLCanvasElement;
  vertext_shader: VS;
  fragment_shader: FS;
}) {
  const gl = opt.canvas.getContext('webgl2')!;
  const program = createProgram(
    gl,
    createShader(gl, gl.VERTEX_SHADER, opt.vertext_shader.trim())!,
    createShader(gl, gl.FRAGMENT_SHADER, opt.fragment_shader.trim())!
  )!;
  gl.useProgram(program);

  const attr = range(gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)).map(
    i => gl.getActiveAttrib(program, i)!
  );
  const unif = range(gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)).map(
    i => gl.getActiveUniform(program, i)!
  );

  const [a, u] = [attr, unif].map(arr => {
    return keyBy(
      arr.map((info, i) => {
        return {
          location: i,
          name: info.name.replace('[0]', ''),
          size: info.size,
          type: gl_parameter_name(gl, info.type),
        };
      }),
      o => o.name
    );
  });
  type MergeValue<T extends object, M extends object> = {
    [key in keyof T]: Simplify<T[key] & M>;
  };
  type $$TYPE = InferSglTypes<VS | FS>;
  type $$ActiveAttribute = MergeValue<
    ConditionalPick<$$TYPE, { $$type_glsl_qualifier: 'attribute' }>,
    typeof a[string]
  >;
  type $$ActiveUniform = MergeValue<
    ConditionalPick<$$TYPE, { $$type_glsl_qualifier: 'uniform' }>,
    typeof u[string]
  >;

  const state = {
    // $$type: null as any as $$TYPE,
    active_attributes: a as $$ActiveAttribute,
    active_uniforms: u as $$ActiveUniform,
    _webgl_ref_array_buffer: null,
    _webgl_ref_element_array_buffer: null,
    _webgl_ref_vao: null,
    // @ts-ignore
    attributes: mapValues(a, i => ({ name: i.name, enabled: false })) as MergeValue<
      $$ActiveAttribute,
      { enabled: false }
    >,
  };

  // @ts-ignore
  return { program, gl, state } as SglProgram<Simplify<typeof state>>;
}

export function sgl_create_vertex_array<S extends SglState>(sgl: SglProgram<S>) {
  const { gl, state, ...rest } = sgl;
  const vao = gl.createVertexArray()!;
  const state2 = merge(state, {
    vertex_array: {
      _webgl_ref: vao,
    },
  });
  // @ts-ignore
  return { gl, state: state2, ...rest } as SglProgram<typeof state2>;
}

export function sgl_enable_vertex_attrib_array<
  S extends SglState,
  Name extends keyof S['attributes']
>(sgl: SglProgram<S>, name: Name) {
  const { gl, state, program } = sgl;
  // @ts-ignore
  gl.enableVertexAttribArray(state.active_attributes[name].location);
  const attr_old = state.attributes[name];
  const attr_new = tf_merge(attr_old, { enabled: true as const });
  if (name in state.attributes) {
    // @ts-ignore
    state.attributes[name] = attr_new;
  }

  return { gl, state: state, program } as SglProgram<typeof state>;
}
