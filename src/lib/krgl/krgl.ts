import type {
  Simplify,
  ValueOf,
  ConditionalPick,
  Merge,
  Schema,
} from "type-fest";
import { MapValue } from "type-fest/source/entry";
import type { KrGlslVarType } from "./constant";
import { createProgram, createShader } from "./helper";
import { type KrGlBufferString, KrGlBuffer } from "./krgl_buffer";
import { KrGlLocationAttribute, KrGlLocationUniform } from "./krgl_location";
import { KrGlVAO } from "./krgo_vao";
import { DefaultGlslSingleInfo, InferGlslLines } from "./type_helper";
import type { KrGlContext } from "./type_interface";

/**
 * KrGl (Krist Webgl2 Wrapper) for easy implement webgl2 **/
//@ts-ignore
export class KrGl<
  WebGlProgramVariable extends Record<string, DefaultGlslSingleInfo>
> implements KrGlContext
{
  /**
   * global enum to reference GLenum
   * @see https://registry.khronos.org/OpenGL/api/GL/glext.h **/
  readonly canvas: HTMLCanvasElement;
  readonly gl: WebGL2RenderingContext;
  readonly program: WebGLProgram;

  static create<VS extends string, FS extends string>(opt: {
    canvas?: HTMLCanvasElement;
    vertext_shader: VS;
    fragment_shader: FS;
    opt?: WebGLContextAttributes;
    // @ts-ignore
  }): KrGl<Simplify<InferGlslLines<VS | FS>>> {
    // @ts-ignore
    return new KrGl(opt);
  }

  constructor(opt: {
    canvas?: HTMLCanvasElement;
    vertext_shader: string;
    fragment_shader: string;
    opt?: WebGLContextAttributes;
  }) {
    this.canvas = opt.canvas ?? document.createElement("canvas");
    const gl = this.canvas.getContext("webgl2", opt.opt ?? {})!;
    this.gl = gl;
    this.program = createProgram(
      gl,
      createShader(gl, gl.VERTEX_SHADER, opt.vertext_shader.trim())!,
      createShader(gl, gl.FRAGMENT_SHADER, opt.fragment_shader.trim())!
    )!;
    this.useprogram(); // auto use program
  }
  // yyy(): string {
  //   throw new Error("Method not implemented.");
  // }
  // xxx(): string {
  //   throw new Error("Method not implemented.");
  // }
  useprogram() {
    this.gl.useProgram(this.program);
    return this;
  }
  attribute_location<
    T extends string &
      keyof ConditionalPick<
        WebGlProgramVariable,
        { variable_qualifier: "attribute" }
      >
  >(name: T, type: WebGlProgramVariable[T]["data_type"]) {
    return new KrGlLocationAttribute(this.gl, this.program, name, type);
  }
  uniform_location<
    T extends string &
      keyof ConditionalPick<
        WebGlProgramVariable,
        { variable_qualifier: "uniform" }
      >
  >(name: T, type: WebGlProgramVariable[T]["data_type"]) {
    return new KrGlLocationUniform(this.gl, this.program, name, type);
  }
  create_vao_state() {
    return new KrGlVAO(this.gl);
  }
  create_buffer<T extends KrGlBufferString>(type: T) {
    return new KrGlBuffer(this.gl, type);
  }

  // bind_vao(vao: KrGlVAO): // @ts-ignore
  // KrGl<WebGlProgramVariable, Merge<BindState, { vao: true }>> {
  //   return this;
  // }
  // bind_array_buffer(buffer: KrGlBuffer<"ARRAY_BUFFER">): // @ts-ignore
  // KrGl<WebGlProgramVariable, Merge<BindState, { array_buffer: true }>> {
  //   return this;
  // }
  // draw_arrays(opt: {
  //   mode?: "TRIANGLES";
  //   offset?: number;
  //   count: number;
  // }): this {
  //   this.gl.drawArrays(
  //     this.gl[opt.mode ?? "TRIANGLES"],
  //     opt.offset ?? 0,
  //     opt.count
  //   );
  //   return this;
  // }
}

// type KrglImplBindState = {
//   vao: true | false;
//   array_buffer: true | false;
//   element_array_buffer: true | false;
// };
// type DefaultKrglImplBindState = { [k in keyof KrglImplBindState]: false };

// type KrMerge<
//   Base extends KrglImplBindState,
//   Add extends Partial<KrglImplBindState>
// > = {
//   [key in keyof Base]: Add extends { [k in key]: true | false }
//     ? Add[key]
//     : Base[key];
// };

// type KrglImplBase<O extends KrglImplBindState = DefaultKrglImplBindState> = {
//   bind_vao(): KrglImplRoot<KrMerge<O, { vao: true }>>;
//   bind_array_buffer(): KrglImplRoot<KrMerge<O, { array_buffer: true }>>;
// };

// type KrglImplDrawArray<O extends KrglImplBindState> = {
//   draw_array_buffer(): KrglImplRoot<O>;
// };

// type KrglImplRoot<O extends KrglImplBindState> = KrglImplBase<O> &
//   (O extends { vao: true } ? KrglImplDrawArray<O> : {});
