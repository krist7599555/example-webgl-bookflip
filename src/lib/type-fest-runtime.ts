import type { Merge } from "type-fest";

export function tf_merge<Lhs, Rhs>(lhs: Lhs, rhs: Rhs): Merge<Lhs, Rhs> {
  return Object.assign({}, lhs, rhs);
}
