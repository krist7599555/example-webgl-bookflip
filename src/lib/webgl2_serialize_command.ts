import { isArray, isTypedArray } from 'lodash-es';

import { __UNSAFE_WEBGL2_FUNC_DEFINITION } from './webgl2_function_definition_type';

export const NUM_TO_GLENUM = (() => {
  if (WebGL2RenderingContext && WebGL2RenderingContext.prototype) {
    return Object.freeze(
      Object.keys(WebGL2RenderingContext.prototype)
        .filter(k => k == k.toUpperCase()) // is GLNUM CONSTANT
        .reduce((mp, key) => {
          // @ts-ignore
          const val = WebGL2RenderingContext.prototype[key];
          if (typeof val === 'number') {
            mp.set(val, `gl.${key}`);
          }
          return mp;
        }, new Map<number, `gl.${string}`>())
    );
  }
  throw new Error('NOT EXISTS');
})();

export function serialize_gl_command(function_name: string, function_parameters: any[]) {
  if (!(function_name in WebGL2RenderingContext.prototype)) {
    throw new Error(`function_name = ${function_name} not exist in WebGL2RenderingContext`);
  }
  const str_paramaters = function_parameters.map((v, i): string => {
    if (v == null || v == undefined) return `${v}`;
    // @ts-ignore
    if (function_name in __UNSAFE_WEBGL2_FUNC_DEFINITION) {
      const arg = __UNSAFE_WEBGL2_FUNC_DEFINITION[function_name][i];
      if (/GLenum/.test(arg) && NUM_TO_GLENUM.has(v)) {
        return NUM_TO_GLENUM.get(v)!;
      }
      if (/GLint|GLfloat|GLboolean|GLuint|GLsize|GLsizei/.test(arg)) {
        return (v.toLocaleString() as string).replace(/,/g, '');
      }
      if (typeof v === 'number') {
        return v.toLocaleString().replace(/,/g, '');
      }
      if (isTypedArray(v)) {
        const class_name =
          v.constructor.toLocaleString().replace('function ', '').split('(')?.[0] ?? 'TypedArray';
        return `${class_name}([${v.toLocaleString()}])`;
      }
      if (isArray(v)) {
        return `[${v.map(v => v?.toLocaleString() ?? v?.toString?.() ?? `${v}`).join(', ')}]`;
      }
    }
    return v?.toLocaleString() ?? v?.toString?.() ?? `${v}`;
  });
  return `gl.${function_name}(${str_paramaters.join(', ')})`;
}
