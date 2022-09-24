import type { Merge, TypedArray } from 'type-fest';

import type { KrGlBiding, KrGlContext, StrictWebGL2RenderingContext } from './type_interface';
import { GlFunc } from './webgl_binding_target';

export type KrGlBufferString = 'ARRAY_BUFFER' | 'UNIFORM_BUFFER' | 'ELEMENT_ARRAY_BUFFER';

export class KrGlArrayBuffer implements KrGlBiding {
  readonly gl: StrictWebGL2RenderingContext<'ARRAY_BUFFER'>;
  readonly buffer: WebGLBuffer;
  readonly target: number;
  static target = 'ARRAY_BUFFER' as const;
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
  // @ts-ignore
  return Object.assign({}, lhs, rhs);
}

export class KrGlBuffer<BUFFTYPE extends KrGlBufferString> implements KrGlBiding, KrGlContext {
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
