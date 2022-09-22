import { isPlainObject, range } from "lodash-es";
import { TypedArray } from "type-fest";
import { assert } from "./krgl/helper";
import {
  gl_parameter_name,
  is_webgl_type,
  WEBGL_TYPE_TABLE,
} from "./sgl/helper";

type ActiveInfo = { size: number; type: string };

export function createProxy<
  T extends {
    attributes: Record<string, ActiveInfo>;
    uniforms: Record<string, ActiveInfo>;
  }
>(gl: WebGL2RenderingContext, program: WebGLProgram) {
  gl.useProgram(program);

  const deproxy_get = <T, F>(target: T, field: F): boolean => {
    try {
      // @ts-ignore
      const out = target[field];
      if (isPlainObject(out)) {
        return { ...out };
      } else {
        return out;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

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
      update_vertex_attrib_pointer(): void;
    };
  };
  const vertext_array_attribute_original: VAOAttrProxy = range(
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
