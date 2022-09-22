import type { TypedArray, Simplify, SetOptional, Merge } from "type-fest";
import { KrGlLocationAttribute } from "./krgl_location";

import type {
  KrGlBiding,
  KrGlContext,
  StrictWebGL2RenderingContext,
} from "./type_interface";
import { GlFunc, GlTargets, gl_target } from "./webgl_binding_target";
import { KrGlslVarType, TYPECONVERT } from "./constant";
import { KrGlVAO } from "./krgo_vao";
import { values } from "lodash-es";
import { assert } from "./helper";

export type KrGlBufferString =
  | "ARRAY_BUFFER"
  | "UNIFORM_BUFFER"
  | "ELEMENT_ARRAY_BUFFER";

export class KrGlArrayBuffer implements KrGlBiding {
  readonly gl: StrictWebGL2RenderingContext<"ARRAY_BUFFER">;
  readonly buffer: WebGLBuffer;
  readonly target: number;
  static target = "ARRAY_BUFFER" as const;
  constructor(public raw_gl: WebGL2RenderingContext) {
    this.gl = raw_gl;
    this.buffer = raw_gl.createBuffer()!;
    this.target = raw_gl[KrGlArrayBuffer.target];
  }
  bind(fn: () => void): this {
    this._unsafe_bind_enable();
    fn();
    this._unsafe_bind_disable();
    return this;
  }
  _unsafe_bind_enable(): this {
    this.gl.bindBuffer(this.target, this.buffer);
    return this;
  }
  _unsafe_bind_disable(): this {
    this.gl.bindBuffer(this.target, null);
    return this;
  }
  bufferData(arr: TypedArray): this {
    this.gl.bufferData(this.target, arr, this.raw_gl.STATIC_DRAW);
    return this;
  }
}

function _merge<A, B>(lhs: A, rhs: B): Merge<A, B> {
  return Object.assign({}, lhs, rhs);
}

class Bind<T extends { [key in GlTargets]?: KrGlBiding }> {
  static create(gl: WebGL2RenderingContext) {
    return new Bind<{}>(gl, {});
  }
  constructor(public gl: WebGL2RenderingContext, public target: T) {}
  array_buffer(target: KrGlArrayBuffer) {
    return new Bind(this.gl, _merge(this.target, { ARRAY_BUFFER: target }));
  }
  vertex_array(target: KrGlVAO) {
    return new Bind(this.gl, _merge(this.target, { VERTEX_ARRAY: target }));
  }
  vertex_attrib_pointer<T extends KrGlslVarType>({
    location,
    ...opt
  }: {
    location: KrGlLocationAttribute<string, T>;
    normalized?: boolean;
    strip?: number;
    offset?: number;
  }) {
    assert(this.target.ARRAY_BUFFER);
    assert(this.target.VERTEX_ARRAY);
    values(this.target).forEach((o) => o._unsafe_bind_enable());
    this.gl.vertexAttribPointer(
      location.location,
      TYPECONVERT[location.type].element_count,
      location.gl[TYPECONVERT[location.type].base_type],
      opt.normalized ?? false,
      opt.strip ?? 0,
      opt.offset ?? 0
    );
    values(this.target).forEach((o) => o._unsafe_bind_disable());
  }
}

export class KrGlBuffer<BUFFTYPE extends KrGlBufferString>
  implements KrGlBiding, KrGlContext
{
  $$func: GlFunc<BUFFTYPE>;
  webgl_buffer: WebGLBuffer;
  buffer_type: BUFFTYPE;
  _data: TypedArray;

  get strict_gl(): Pick<WebGL2RenderingContext, GlFunc<BUFFTYPE>> {
    return this.gl;
  }

  constructor(public gl: WebGL2RenderingContext, buffer_type: BUFFTYPE) {
    this.buffer_type = buffer_type;
    this.webgl_buffer = this.gl.createBuffer()!;
    this._data = new Float32Array([]);
  }
  _unsafe_bind_enable(): this {
    this.gl.bindBuffer(this.gl[this.buffer_type], this.webgl_buffer);
    return this;
  }
  _unsafe_bind_disable(): this {
    this.gl.bindBuffer(this.gl[this.buffer_type], null);
    return this;
  }
  bind(fn: () => void): this {
    this._unsafe_bind_enable();
    fn();
    this._unsafe_bind_disable();
    return this;
  }
  data(inp: TypedArray) {
    this._data = inp;
    this.bind(() => {
      this.gl.bufferData(this.gl[this.buffer_type], inp, this.gl.STATIC_DRAW);
    });
    return this;
  }
  update() {
    return this.data(this._data);
  }
}
