import { GlFunc, GlTargets } from "./webgl_binding_target";

export interface KrGlBiding {
  bind(fn: () => void): this;
  _unsafe_bind_enable(): this;
  _unsafe_bind_disable(): this;
}

export interface KrGlContext {
  readonly gl: WebGL2RenderingContext;
}
export type StrictWebGL2RenderingContext<Target extends GlTargets> = Pick<
  WebGL2RenderingContext,
  GlFunc<Target>
>;
