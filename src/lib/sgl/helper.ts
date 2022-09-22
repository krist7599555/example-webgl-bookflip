import type { PartialDeep, Merge } from "type-fest";
import { merge } from "lodash-es";

export function gl_parameter_name(gl: WebGL2RenderingContext, value: number) {
  for (const key in gl) {
    // @ts-ignore
    if (gl[key] === value) {
      return key;
    }
  }
  throw new Error("not found");
}

export function _merge<
  T extends object,
  D extends PartialDeep<T, { recurseIntoArrays: false }>
>(base: T, add: D): Merge<T, D> {
  return merge({}, base, add) as any;
}
