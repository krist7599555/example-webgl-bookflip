import {
  isArray,
  isNumber,
  isPlainObject,
  isTypedArray,
  range,
} from "lodash-es";
import { match } from "ts-pattern";
import { Simplify, TypedArray, ValueOf } from "type-fest";
import { InferAttribute, InferUniform } from "./glsl_string_infer_type";
import { assert, createProgram, createShader } from "./krgl/helper";
import {
  gl_parameter_name,
  is_webgl_type,
  WebglType,
  WEBGL_TYPE_TABLE,
} from "./sgl/helper";

type ActiveInfo = { size: number; type: WebglType };

export function createProxyGLfromShader<
  VS extends string,
  FS extends string
>(opt: { canvas: HTMLCanvasElement; vertex_shader: VS; fragment_shader: FS }) {
  const { canvas, vertex_shader: vs, fragment_shader: fs } = opt;
  const gl = canvas.getContext("webgl2")!;
  const program = createProgram(
    gl,
    createShader(gl, gl.VERTEX_SHADER, vs.trim())!,
    createShader(gl, gl.FRAGMENT_SHADER, fs.trim())!
  )!;
  gl.useProgram(program);

  // @ts-ignore
  return createProxyGLfromWebglProgram<{
    attributes: Simplify<InferAttribute<VS>>;
    uniforms: Simplify<InferUniform<VS | FS>>;
  }>(gl, program);
}

export function createProxyGLfromWebglProgram<
  T extends {
    attributes: Record<string, ActiveInfo>;
    uniforms: Record<string, ActiveInfo>;
  }
>(gl: WebGL2RenderingContext, program: WebGLProgram) {
  gl.useProgram(program);

  console.log("HI");
  type VAOAttrProxy = {
    [key in keyof T["attributes"]]: {
      readonly location: number;
      readonly name: key;
      readonly size: T["attributes"][key]["size"];
      readonly type: T["attributes"][key]["type"];
      enabled: boolean;
      offset: number;
      stripe: number;
      buffer: any;
      divisor: number;
      update_vertex_attrib_pointer(): void;
    };
  };
  type UniformProxy = {
    [key in keyof T["uniforms"]]: {
      readonly location: WebGLUniformLocation;
      readonly name: key;
      readonly size: T["uniforms"][key]["size"];
      readonly type: T["uniforms"][key]["type"];
      data: Iterable<number>;
    };
  };

  const uniforms: Simplify<UniformProxy> = range(
    gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
  ).reduce((acc, i) => {
    const info = gl.getActiveUniform(program, i)!;
    const str_type = gl_parameter_name(gl, info.type);
    assert(is_webgl_type(str_type));
    const new_uniform: ValueOf<UniformProxy> = new Proxy(
      {
        location: gl.getUniformLocation(program, info.name)!,
        name: info.name,
        size: info.size,
        type: str_type,
        data: [] as Iterable<number>,
      },
      {
        set(target, field, new_val) {
          if (field == "data") {
            assert(
              isTypedArray(new_val) ||
                (isArray(new_val) && new_val.every(isNumber))
            );
            const [...nums] = new_val as
              | Float32Array
              | number[]
              | Iterable<number>;

            // prettier-ignore
            match(str_type)
              .with("FLOAT", () => gl.uniform1fv(target.location, nums))
              .with("FLOAT_VEC2", () => gl.uniform2fv(target.location, nums))
              .with("FLOAT_VEC3", () => gl.uniform3fv(target.location, nums))
              .with("FLOAT_VEC4", () => gl.uniform4fv(target.location, nums))
              .with("INT", () => gl.uniform1iv(target.location, nums))
              .with("INT_VEC2", () => gl.uniform2iv(target.location, nums))
              .with("INT_VEC3", () => gl.uniform3iv(target.location, nums))
              .with("INT_VEC4", () => gl.uniform4iv(target.location, nums))
              .with("UNSIGNED_INT", () => gl.uniform1uiv(target.location, nums))
              .with("UNSIGNED_INT_VEC2", () => gl.uniform2uiv(target.location, nums))
              .with("UNSIGNED_INT_VEC3", () => gl.uniform3uiv(target.location, nums))
              .with("UNSIGNED_INT_VEC4", () => gl.uniform4uiv(target.location, nums))
              .with("FLOAT_MAT2", () => gl.uniformMatrix2fv(target.location, false, nums))
              .with("FLOAT_MAT2x3", () => gl.uniformMatrix2x3fv(target.location, false, nums))
              .with("FLOAT_MAT2x4", () => gl.uniformMatrix2x4fv(target.location, false, nums))
              .with("FLOAT_MAT3x2", () => gl.uniformMatrix3x2fv(target.location, false, nums))
              .with("FLOAT_MAT3", () => gl.uniformMatrix3fv(target.location, false, nums))
              .with("FLOAT_MAT3x4", () => gl.uniformMatrix3x4fv(target.location, false, nums))
              .with("FLOAT_MAT4x2", () => gl.uniformMatrix4x2fv(target.location, false, nums))
              .with("FLOAT_MAT4x3", () => gl.uniformMatrix4x3fv(target.location, false, nums))
              .with("FLOAT_MAT4", () => gl.uniformMatrix4fv(target.location, false, nums))
              //@ts-expect-error
              .exhaustive()
            target.data = nums;
            return true;
          }
          return false;
        },
      }
    );
    // @ts-ignore
    acc[info.name] = new_uniform;
    return acc;
  }, {} as UniformProxy);

  const vertext_array_attribute_original: Simplify<VAOAttrProxy> = range(
    gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)
  ).reduce((acc, i) => {
    const info = gl.getActiveAttrib(program, i)!;
    const str_type = gl_parameter_name(gl, info.type);
    assert(is_webgl_type(str_type));
    // @ts-ignore
    const a = new Proxy(
      {
        location: i,
        name: info.name,
        size: info.size,
        type: str_type,
        enabled: false,
        offset: 0,
        normalize: false,
        stripe: WEBGL_TYPE_TABLE[str_type].size_byte,
        buffer: null as null | WebGLBuffer,
        divisor: 0,
        update_vertex_attrib_pointer() {
          gl.vertexAttribPointer(
            a.location,
            WEBGL_TYPE_TABLE[a.type].element_count,
            gl[WEBGL_TYPE_TABLE[a.type].base_type],
            a.normalize,
            a.stripe,
            a.offset
          );
        },
      },
      {
        set(target, field, new_val, receive) {
          console.log("SET ATTR", info.name, field, new_val);
          const f: keyof typeof target = field as any;
          if (f == "buffer") {
            console.error("not allow set buffer");
            return false;
          }
          if (f == "enabled") {
            assert(typeof new_val == "boolean");
            target.enabled = new_val;
            console.log("WEBGL location enabled", new_val);
            if (new_val) {
              gl.enableVertexAttribArray(target.location);
            } else {
              gl.disableVertexAttribArray(target.location);
            }
            return true;
          }
          if (f == "offset" || f == "stripe") {
            assert(
              res.array_buffer,
              "require bind array buffer first before set vertexAttribPointer"
            );
            assert(typeof new_val == "number");
            // @ts-ignore
            const gl_type = gl[target.type];
            assert(typeof gl_type == "number");
            target[f] = new_val;
            target.buffer = res.array_buffer; // INTERNAL USE ACRIVE ARRAY BUFFER
            target.update_vertex_attrib_pointer();
            return true;
          }
          if (f == "divisor") {
            assert(typeof new_val == "number");
            target.divisor = new_val;
            gl.vertexAttribDivisor(target.location, new_val);
          }
          return false;
        },
      }
    );
    return { ...acc, [info.name]: a };
  }, {} as VAOAttrProxy);

  const vertext_array_attribute_proxy = new Proxy(
    vertext_array_attribute_original,
    {
      set(target, p, newValue, receiver) {
        console.log([target, p, newValue, receiver]);
        return false;
      },
    }
  );
  const vao = gl.createVertexArray()!; // TODO: for now have single vao
  gl.bindVertexArray(vao);
  const vertext_array = new Proxy(
    {
      get vao() {
        return vao;
      },
      get attributes() {
        return vertext_array_attribute_proxy;
      },
    },
    {
      // get(t, f) {
      //   return deproxy_get(t, f);
      // },
    }
  );

  const res = new Proxy(
    {
      get gl() {
        return gl;
      },
      get program() {
        return program;
      },
      array_buffer: null as WebGLBuffer | null,
      array_buffer_data: null as TypedArray | null,
      get vertext_array() {
        return vertext_array;
      },
      get uniforms() {
        return uniforms;
      },
      draw_array(opt: {
        mode: "TRIANGLES" | "POINTS";
        count: number;
        first?: number;
      }) {
        gl.drawArrays(gl[opt.mode], opt.first ?? 0, opt.count);
      },
    },
    {
      // get(t, f) {
      //   return deproxy_get(t, f);
      // },
      set(target, field, new_val, old_val) {
        if (field == "array_buffer_data") {
          // TODO: not a cool name should it be target.array_buffer.read(...)
          target.array_buffer_data = new_val;
          gl.bufferData(gl.ARRAY_BUFFER, new_val, gl.STATIC_DRAW);
          return true;
        }
        if (field == "array_buffer") {
          assert(new_val === null || new_val instanceof WebGLBuffer);
          target.array_buffer = new_val;
          if (!new_val) {
            target.array_buffer_data = null; // TODO: clean
          }
          console.log("WEGL bind array buffer", new_val);
          gl.bindBuffer(gl.ARRAY_BUFFER, new_val);
          return true;
        }
        return false;
      },
    }
  );
  return res;
}
