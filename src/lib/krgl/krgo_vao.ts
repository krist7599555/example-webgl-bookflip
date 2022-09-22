import { assert } from './helper';
import type { KrGlBiding } from './type_interface';

/** snapshot of buffer state for multiple draw */
export class KrGlVAO implements KrGlBiding {
  readonly vao: WebGLVertexArrayObject;
  constructor(public readonly gl: WebGL2RenderingContext) {
    this.vao = this.gl.createVertexArray()!;
    assert(this.vao);
  }
  _unsafe_bind_enable() {
    this.gl.bindVertexArray(this.vao);
    return this;
  }
  _unsafe_bind_disable() {
    this.gl.bindVertexArray(null);
    return this;
  }
  bind(fn: () => void) {
    this._unsafe_bind_enable();
    fn();
    this._unsafe_bind_disable();
    return this;
  }
}
