import { values } from "lodash-es";

import { KrGl } from "./krgl";
import type { KrGlBuffer } from "./krgl_buffer";
import type { KrGlVAO } from "./krgo_vao";

export { KrGl };

/* scope bind reference to make function more readable */
export function webgl_bind(
  opt: {
    vao?: KrGlVAO;
    array_buffer?: KrGlBuffer<"ARRAY_BUFFER">;
    element_array_buffer?: KrGlBuffer<"ELEMENT_ARRAY_BUFFER">;
  },
  fn: () => void
) {
  values(opt).forEach((o) => o._unsafe_bind_enable());
  fn();
  values(opt).forEach((o) => o._unsafe_bind_disable());
}
