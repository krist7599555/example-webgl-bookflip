import {
  type KrGlslVarInfoType,
  type KrGlslVarType,
  TYPECONVERT,
} from "./constant";
import { assert } from "./helper";
import type { KrGlContext } from "./type_interface";

class KrGlLocationBase<NAME extends string, TYPE extends KrGlslVarType> {
  constructor(public readonly name: NAME, public readonly type: TYPE) {}
}

export class KrGlLocationAttribute<
    NAME extends string,
    TYPE extends KrGlslVarType
  >
  extends KrGlLocationBase<NAME, TYPE>
  implements KrGlContext
{
  readonly location: number;
  private flag: {
    enable_vert_attr_arr: boolean;
  };
  constructor(
    public readonly gl: WebGL2RenderingContext,
    public readonly program: WebGLProgram,
    name: NAME,
    type: TYPE
  ) {
    super(name, type);
    this.location = this.gl.getAttribLocation(this.program, name)! as any;
    this.flag = {
      enable_vert_attr_arr: false,
    };
    assert(this.location > -1);
  }
  enable_attr_array(): this {
    this.flag.enable_vert_attr_arr = true;
    this.gl.enableVertexAttribArray(this.location);
    return this;
  }
  disable_attr_array(): this {
    this.flag.enable_vert_attr_arr = false;
    this.gl.disableVertexAttribArray(this.location);
    return this;
  }
  set_attr_data_fallback<
    T extends KrGlslVarInfoType[TYPE]["gl_setter_attr"] = KrGlslVarInfoType[TYPE]["gl_setter_attr"]
  >(param: {
    data: Parameters<WebGL2RenderingContext[T]> extends [number, ...infer Rest]
      ? Rest
      : never;
  }): this {
    assert(
      !this.flag.enable_vert_attr_arr,
      "require enable_vert_attr_arr == false"
    );
    // @ts-ignore
    this.gl[TYPECONVERT[this.type].gl_setter_attr](
      this.location,
      // @ts-ignore
      ...param.data
    );
    return this;
  }
  set_attr_to_active_array_buffer(
    opt: {
      strip?: number;
      offset?: number;
      normalized?: boolean;
    } = {}
  ): this {
    assert(
      this.flag.enable_vert_attr_arr,
      "require enable_vert_attr_arr == true"
    );
    this.gl.vertexAttribPointer(
      this.location,
      TYPECONVERT[this.type].element_count,
      this.gl[TYPECONVERT[this.type].base_type],
      opt.normalized ?? false,
      opt.strip ?? 0,
      opt.offset ?? 0
    );
    return this;
  }
  /* instance draw setup */
  vertex_attr_divisor(divide = 1): this {
    this.gl.vertexAttribDivisor(this.location, divide);
    return this;
  }
}
export class KrGlLocationUniform<
  NAME extends string,
  TYPE extends KrGlslVarType
> extends KrGlLocationBase<NAME, TYPE> {
  readonly location: WebGLUniformLocation;
  constructor(
    public readonly gl: WebGL2RenderingContext,
    public readonly program: WebGLProgram,
    name: NAME,
    type: TYPE
  ) {
    super(name, type);
    this.location = this.gl.getUniformLocation(this.program, name)!;
    assert(this.location);
  }
  set_uniform_data<
    T extends KrGlslVarInfoType[TYPE]["gl_setter_uniform"] = KrGlslVarInfoType[TYPE]["gl_setter_uniform"]
  >(param: {
    data: Parameters<WebGL2RenderingContext[T]> extends [
      WebGLUniformLocation | null,
      ...infer Rest
    ]
      ? Rest
      : never;
  }) {
    // @ts-ignore
    this.gl[TYPECONVERT[this.type].gl_setter_uniform](
      this.location as any,
      // @ts-ignore
      ...param.data
    );
  }
}
