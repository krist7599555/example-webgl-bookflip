import type { Merge, Split, Trim } from "type-fest";

export function tf_merge<Lhs, Rhs>(lhs: Lhs, rhs: Rhs): Merge<Lhs, Rhs> {
  return Object.assign({}, lhs, rhs);
}
export function tf_split<S extends string, Delimiter extends string>(
  s: S,
  d: Delimiter
): Split<S, Delimiter> {
  return s.split(d) as any;
}
export function tf_trim<S extends string>(s: S): Trim<S> {
  return s.trim() as any;
}
