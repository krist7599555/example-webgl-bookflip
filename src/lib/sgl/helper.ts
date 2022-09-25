import { merge } from 'lodash-es';
import type { Merge, PartialDeep } from 'type-fest';

// prettier-ignore
export const WEBGL_TYPE_TABLE = {
  "BOOL":              { base_type: "BOOL",         base_type_byte: 1, element_count: 1,   size_byte: 1 * (1  ) },
  "BOOL_VEC2":         { base_type: "BOOL",         base_type_byte: 1, element_count: 2,   size_byte: 1 * (2  ) },
  "BOOL_VEC3":         { base_type: "BOOL",         base_type_byte: 1, element_count: 3,   size_byte: 1 * (3  ) },
  "BOOL_VEC4":         { base_type: "BOOL",         base_type_byte: 1, element_count: 4,   size_byte: 1 * (4  ) },
  "INT":               { base_type: "INT",          base_type_byte: 4, element_count: 1,   size_byte: 4 * (1  ) },
  "INT_VEC2":          { base_type: "INT",          base_type_byte: 4, element_count: 2,   size_byte: 4 * (2  ) },
  "INT_VEC3":          { base_type: "INT",          base_type_byte: 4, element_count: 3,   size_byte: 4 * (3  ) },
  "INT_VEC4":          { base_type: "INT",          base_type_byte: 4, element_count: 4,   size_byte: 4 * (4  ) },
  "UNSIGNED_INT":      { base_type: "UNSIGNED_INT", base_type_byte: 4, element_count: 1,   size_byte: 4 * (1  ) },
  "UNSIGNED_INT_VEC2": { base_type: "UNSIGNED_INT", base_type_byte: 4, element_count: 2,   size_byte: 4 * (2  ) },
  "UNSIGNED_INT_VEC3": { base_type: "UNSIGNED_INT", base_type_byte: 4, element_count: 3,   size_byte: 4 * (3  ) },
  "UNSIGNED_INT_VEC4": { base_type: "UNSIGNED_INT", base_type_byte: 4, element_count: 4,   size_byte: 4 * (4  ) },
  "FLOAT":             { base_type: "FLOAT",        base_type_byte: 4, element_count: 1,   size_byte: 4 * (1  ) },
  "FLOAT_VEC2":        { base_type: "FLOAT",        base_type_byte: 4, element_count: 2,   size_byte: 4 * (2  ) },
  "FLOAT_VEC3":        { base_type: "FLOAT",        base_type_byte: 4, element_count: 3,   size_byte: 4 * (3  ) },
  "FLOAT_VEC4":        { base_type: "FLOAT",        base_type_byte: 4, element_count: 4,   size_byte: 4 * (4  ) },
  "FLOAT_MAT2":        { base_type: "FLOAT",        base_type_byte: 4, element_count: 2*2, size_byte: 4 * (2*2) },
  "FLOAT_MAT2x3":      { base_type: "FLOAT",        base_type_byte: 4, element_count: 2*3, size_byte: 4 * (2*3) },
  "FLOAT_MAT2x4":      { base_type: "FLOAT",        base_type_byte: 4, element_count: 2*4, size_byte: 4 * (2*4) },
  "FLOAT_MAT3x2":      { base_type: "FLOAT",        base_type_byte: 4, element_count: 3*2, size_byte: 4 * (3*2) },
  "FLOAT_MAT3":        { base_type: "FLOAT",        base_type_byte: 4, element_count: 3*3, size_byte: 4 * (3*3) },
  "FLOAT_MAT3x4":      { base_type: "FLOAT",        base_type_byte: 4, element_count: 3*4, size_byte: 4 * (3*4) },
  "FLOAT_MAT4x2":      { base_type: "FLOAT",        base_type_byte: 4, element_count: 4*2, size_byte: 4 * (4*2) },
  "FLOAT_MAT4x3":      { base_type: "FLOAT",        base_type_byte: 4, element_count: 4*3, size_byte: 4 * (4*3) },
  "FLOAT_MAT4":        { base_type: "FLOAT",        base_type_byte: 4, element_count: 4*4, size_byte: 4 * (4*4) },
  "SAMPLER_2D":        { base_type: "SAMPLER_2D" } as never
} as const;
export type WebglType = keyof typeof WEBGL_TYPE_TABLE;
export type WebglBaseType = typeof WEBGL_TYPE_TABLE[WebglType]['base_type'];
export function is_webgl_type(s: string): s is WebglType {
  return s in WEBGL_TYPE_TABLE;
}

export function gl_parameter_name(gl: WebGL2RenderingContext, value: number) {
  for (const key in gl) {
    // @ts-ignore
    if (gl[key] === value) {
      return key;
    }
  }
  throw new Error('not found');
}

export function _merge<T extends object, D extends PartialDeep<T, { recurseIntoArrays: false }>>(
  base: T,
  add: D
): Merge<T, D> {
  return merge({}, base, add) as any;
}
