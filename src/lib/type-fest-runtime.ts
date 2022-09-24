import type {
  ConditionalPick,
  Merge,
  Simplify,
  Split,
  Trim,
  StringKeyOf,
} from "type-fest";

export function tf_merge<Lhs, Rhs>(lhs: Lhs, rhs: Rhs): Merge<Lhs, Rhs> {
  return Object.assign({}, lhs, rhs);
}
export function tf_split<S extends string, Delimiter extends string>(
  s: S,
  d: Delimiter
): Split<S, Delimiter> {
  return s.split(d) as any;
}
export function tf_str_includes<S extends string, M extends string>(
  s: S,
  m: M
  // @ts-ignore
): s is `${string}${M}${string}` {
  return s.includes(m);
}
export function tf_trim<S extends string>(s: S): Trim<S> {
  return s.trim() as any;
}

export function tf_keys<T>(o: T): StringKeyOf<T>[] {
  return Object.keys(o as any) as any;
}
