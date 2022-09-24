import { isArray, isNumber, isObject, isTypedArray, range, uniqueId } from 'lodash-es';
import { match } from 'ts-pattern';
import { Simplify, TypedArray, ValueOf } from 'type-fest';

import { InferAttribute, InferUniform } from './glsl_string_infer_type';
import { assert, createProgram, createShader } from './krgl/helper';
import { gl_parameter_name, is_webgl_type, WEBGL_TYPE_TABLE, WebglType } from './sgl/helper';
import { tf_keys } from './type-fest-runtime';

type ActiveInfo = { size: number; type: WebglType };

function _debug_gl(gl: WebGL2RenderingContext): WebGL2RenderingContext {
  const reverse_gl_constant = new Map<number, `gl.${string}`>();
  for (const key of tf_keys(gl)) {
    const val = gl[key];
    if (key == key.toUpperCase() && typeof val === 'number') {
      reverse_gl_constant.set(val, `gl.${key}`);
    }
  }
  function _strinify_arg(i: any) {
    if (typeof i == 'number' && i > 10 && reverse_gl_constant.has(i)) {
      return reverse_gl_constant.get(i);
    }
    if (i && typeof i == 'object' && typeof i[Symbol.iterator] == 'function') {
      return JSON.stringify(Array.from(i));
    }
    return `${i}`;
  }
  WebGLBuffer.prototype.toString = function () {
    return this.debug_id ? `[object WebGLBuffer(id=${this.debug_id})]` : `[object WebGLBuffer]`;
  };
  return new Proxy(gl, {
    get(t, _p) {
      assert(typeof _p == 'string');
      const p = _p as keyof WebGL2RenderingContext;
      try {
        const o: any = Reflect.get(t, p, gl);
        if (typeof o === 'function') {
          return (...args: any[]) => {
            const str_command = `gl.${p}(${args.map(_strinify_arg).join(', ')})`;
            console.log('[DEUBGGL:CALL]', str_command);
            const res = o.bind(gl)(...args);
            if (p === 'createBuffer' && res instanceof WebGLBuffer) {
              res.debug_id = typeof args[0] == 'string' ? args[0] : uniqueId('auto-');
            }
            if (res) {
              console.log('[DEUBGGL:CALL]', str_command, '=', res);
            }
            return res;
          };
        }
        return o;
      } catch (err) {
        console.log('[DEBUGGL:ERROR]', `gl.${p.toString()}`);
        throw err;
      }
    },
  });
}

export function createProxyGLfromShader<VS extends string, FS extends string>(opt: {
  canvas: HTMLCanvasElement;
  vertex_shader: VS;
  fragment_shader: FS;
}) {
  const { canvas, vertex_shader: vs, fragment_shader: fs } = opt;
  const gl = _debug_gl(canvas.getContext('webgl2')!);
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

  type VAOAttrProxy = {
    [key in keyof T['attributes']]: {
      /**
       * real webgl location from program
       */
      readonly location: number;
      /**
       * real webgl attribute name in glsl
       */
      readonly name: key;
      /**
       * @type {gl.getAttribLocation().size}
       */
      readonly size: T['attributes'][key]['size'];
      /**
       * @type {"FLOAT"|"FLOAT_VEC2"|"FLOAT_VEC3"|"FLOAT_MAT3"|"FLOAT_MAT4" }
       */
      readonly type: T['attributes'][key]['type'];
      /**
       * invoke
       * @type {gl.enableVertexAttribArray} + @type {gl.vertexAttribPointer}
       * @type {gl.disableVertexAttribArray}
       * @default false
       **/
      enabled: boolean;
      /**
       * @proxy @type {gl.vertexAttribPointer}
       * @default 0
       **/
      offset: number;
      /**
       * @proxy @type {gl.vertexAttribPointer}
       * @default WEBGL_TYPE_TABLE[.type].size_byte
       **/
      stripe: number;
      /**
       * @proxy @type {gl.bindData}
       **/
      buffer: any;
      /**
       * @proxy @type {gl.vertexAttribDivisor}
       * @default 0
       **/
      divisor: number;

      /** helper becaule attribute process data by `vec4`. for `mat4` you need to call
       * ```js
       * gl.somefunc(loc)
       * gl.somefunc(loc+2)
       * gl.somefunc(loc+3)
       * gl.somefunc(loc+4)
       * ```
       **/
      readonly _loc_and_offset: {
        loc: number;
        row: number;
        col: number;
        offset: number;
        stripe: number;
      }[];
      update_vertex_attrib_pointer(): void;
    };
  };
  type UniformProxy = {
    [key in keyof T['uniforms']]: {
      readonly location: WebGLUniformLocation;
      readonly name: key;
      readonly size: T['uniforms'][key]['size'];
      readonly type: T['uniforms'][key]['type'];
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
          if (field == 'data') {
            assert(isTypedArray(new_val) || (isArray(new_val) && new_val.every(isNumber)));
            const [...nums] = new_val as Float32Array | number[] | Iterable<number>;

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
        location: gl.getAttribLocation(program, info.name),
        name: info.name,
        size: info.size,
        type: str_type,
        enabled: false,
        offset: 0,
        normalize: false,
        stripe: WEBGL_TYPE_TABLE[str_type].size_byte,
        buffer: null as null | WebGLBuffer,
        divisor: 0,
        get _loc_and_offset(): VAOAttrProxy[keyof VAOAttrProxy]['_loc_and_offset'] {
          if (str_type.includes('MAT')) {
            const [srow, scol = srow] = str_type.split('MAT')[1].split('x');
            const [row, col] = [+srow, +scol];
            return range(0, row).map(i => ({
              loc: (a.location + i) as number,
              row,
              col,
              offset: WEBGL_TYPE_TABLE[str_type].base_type_byte * i * row,
              stripe: WEBGL_TYPE_TABLE[str_type].size_byte,
            }));
          } else {
            return [
              {
                loc: a.location,
                row: 1,
                col: WEBGL_TYPE_TABLE[str_type].element_count,
                offset: 0,
                stripe: WEBGL_TYPE_TABLE[str_type].size_byte,
              },
            ];
          }
        },
        update_vertex_attrib_pointer() {
          const base_type = WEBGL_TYPE_TABLE[a.type].base_type;
          assert(base_type == 'FLOAT');
          const base_type_i = gl[base_type];
          for (const o of this._loc_and_offset) {
            gl.vertexAttribPointer(
              o.loc,
              o.col,
              base_type_i,
              a.normalize,
              a.stripe,
              a.offset + o.offset
            );
          }
        },
      },
      {
        set(target, field, new_val, _receive) {
          const f: keyof typeof target = field as any;
          if (f == 'buffer') {
            console.error('not allow set buffer');
            return false;
          }
          if (f == 'enabled') {
            assert(typeof new_val == 'boolean');
            target.enabled = new_val;
            if (new_val) {
              for (const o of target._loc_and_offset) {
                gl.enableVertexAttribArray(o.loc);
              }
              target.update_vertex_attrib_pointer();
            } else {
              for (const o of target._loc_and_offset) {
                gl.disableVertexAttribArray(o.loc);
              }
            }
            return true;
          }
          if (f == 'offset' || f == 'stripe') {
            assert(
              res.array_buffer,
              'require bind array buffer first before set vertexAttribPointer'
            );
            assert(typeof new_val == 'number');
            // @ts-ignore
            const gl_type = gl[target.type];
            assert(typeof gl_type == 'number');
            target[f] = new_val;
            target.buffer = res.array_buffer; // INTERNAL USE ACRIVE ARRAY BUFFER
            target.update_vertex_attrib_pointer();
            return true;
          }
          if (f == 'divisor') {
            assert(typeof new_val == 'number');
            target.divisor = new_val;
            for (const o of target._loc_and_offset) {
              gl.vertexAttribDivisor(o.loc, new_val);
            }
            return true;
          }
          return false;
        },
      }
    );
    return { ...acc, [info.name]: a };
  }, {} as VAOAttrProxy);

  const vertext_array_attribute_proxy = new Proxy(vertext_array_attribute_original, {
    set() {
      return false;
    },
  });
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
      set array_buffer_data(
        opt:
          | TypedArray
          | {
              data: TypedArray;
              usage?: 'STATIC_DRAW' | 'DYNAMIC_DRAW' | 'STREAM_DRAW';
              offset?: number;
              length?: number;
            }
      ) {
        assert(res.array_buffer);
        const [data, usage = 'STATIC_DRAW', offset = undefined, length = undefined] =
          isObject(opt) && 'data' in opt
            ? [opt.data, opt.usage ?? ('STATIC_DRAW' as const), opt.offset, opt.length]
            : [opt, 'STATIC_DRAW' as const, 0];

        gl.bufferData(gl.ARRAY_BUFFER, data, gl[usage], offset ?? 0, length);
      },
      get vertext_array() {
        return vertext_array;
      },
      get uniforms() {
        return uniforms;
      },
      draw_array(opt: { mode: 'TRIANGLES' | 'POINTS'; count: number; first?: number }) {
        gl.drawArrays(gl[opt.mode], opt.first ?? 0, opt.count);
      },
      draw_array_instanced(opt: {
        mode: 'TRIANGLES' | 'POINTS';
        count: number;
        instance_count: number;
        first?: number;
      }) {
        gl.drawArraysInstanced(gl[opt.mode], opt.first ?? 0, opt.count, opt.instance_count);
      },
    },
    {
      // get(t, f) {
      //   return deproxy_get(t, f);
      // },
      set(target, field, new_val, old_val) {
        if (field == 'array_buffer') {
          assert(new_val === null || new_val instanceof WebGLBuffer);
          target.array_buffer = new_val;
          gl.bindBuffer(gl.ARRAY_BUFFER, new_val);
          return true;
        }
        return Reflect.set(target, field, new_val, old_val);
      },
    }
  );

  // @ts-expect-error
  window['proxygl'] = res;
  return res;
}
