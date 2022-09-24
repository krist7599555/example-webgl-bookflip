const EL_SIZE = {
  byte: 1,
  bool: 1,
  int: 4,
  float: 4,
} as const;
const EL_COUNT = {
  vec2: 2,
  vec3: 3,
  vec4: 4,
  mat2: 2 * 2,
  mat3: 3 * 3,
  mat4: 4 * 4,
  mat2x2: 2 * 2,
  mat2x3: 2 * 3,
  mat2x4: 2 * 4,
  mat3x2: 3 * 2,
  mat3x3: 3 * 3,
  mat3x4: 3 * 4,
  mat4x2: 4 * 2,
  mat4x3: 4 * 3,
  mat4x4: 4 * 4,
} as const;

const BYTE_REGEX = new RegExp(
  `^(<base>?${Object.keys(EL_SIZE)})_(<count>${Object.keys(EL_COUNT)})$`
);

type ByteBase = keyof typeof EL_SIZE;
type ByteStruct = keyof typeof EL_COUNT;
type ByteKey = ByteBase | ByteStruct | `${ByteBase}_${ByteStruct}`;

/** BYTE is proxy object to retrive size in byte of everything */
export const BYTE = new Proxy<Record<Lowercase<ByteKey> | Uppercase<ByteKey>, number>>({} as any, {
  get(target, _p, _receiver) {
    const p = _p.toString().toLowerCase() as Lowercase<ByteKey>;

    // @ts-ignore
    if (p in EL_SIZE) return EL_SIZE[p];
    // @ts-ignore
    if (p in EL_COUNT) return EL_SIZE.float * EL_COUNT[p];
    const r = p.match(BYTE_REGEX);
    if (!r) {
      throw new Error(`byte of ${p} not found`);
    }
    // @ts-ignore
    const o = EL_SIZE[r.groups.base] * EL_COUNT[r.groups.count];
    if (typeof o != 'number' || !Number.isInteger(o)) {
      throw new Error(`byte of ${p} not found`);
    }
    return o;
  },
});
