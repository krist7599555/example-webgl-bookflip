import { isArray, isNumber, isTypedArray, range } from 'lodash-es';
import { match } from 'ts-pattern';
import { Simplify, TypedArray, ValueOf } from 'type-fest';

import { InferAttribute, InferUniform } from './glsl_string_infer_type';
import { assert, createProgram, createShader } from './krgl/helper';
import { LOG_COLOR } from './log';
import { gl_parameter_name, is_webgl_type, WEBGL_TYPE_TABLE, WebglType } from './sgl/helper';
import { serialize_gl_command } from './webgl2_serialize_command';

type ActiveInfo = { size: number; type: WebglType };

function __unsafe_inspect_webgl(
  gl: WebGL2RenderingContext,
  callback: {
    enable: () => boolean;
    listen_command: (...args: string[]) => void;
  }
): WebGL2RenderingContext {
  assert(callback.enable);
  assert(callback.listen_command);

  return new Proxy(gl, {
    get(t, p) {
      assert(typeof p == 'string');
      const o: any = Reflect.get(t, p, gl);
      if (typeof o === 'number') return o;
      if (typeof o === 'function') {
        return (...args: any[]) => {
          if (callback.enable()) {
            callback.listen_command(serialize_gl_command(p, args));
          }
          return o.bind(gl)(...args);
        };
      }
      return o;
    },
  });
}

export function createProxyGLfromShader<VS extends string, FS extends string>(opt: {
  canvas: HTMLCanvasElement;
  vertex_shader: VS;
  fragment_shader: FS;
}) {
  const { canvas, vertex_shader: vs, fragment_shader: fs } = opt;
  // assign debug gl here
  const gl = canvas.getContext('webgl2')!;
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

  let _inspect = false;
  gl = __unsafe_inspect_webgl(gl, {
    enable: () => _inspect,
    listen_command(...cmd) {
      console.log(
        ...cmd.map(c => {
          return c
            .replace(/(gl\.[A-Z_][A-Z_0-9]+)/g, `${LOG_COLOR.fg.green}$1${LOG_COLOR.reset}`)
            .replace(/(gl\.[a-z][a-zA-Z_0-9]+)/g, `${LOG_COLOR.fg.magenta}$1${LOG_COLOR.reset}`)
            .replace(
              /(true|false|undefined|null|\[object WebGL.*\]| [A-Za-z0-9]+Array)/g,
              `${LOG_COLOR.fg.blue}$1${LOG_COLOR.reset}`
            );
        })
      );
    },
  });
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
      buffer: WebGLBuffer | null;
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
    console.log(str_type);
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
              .with("SAMPLER_2D", () => gl.uniform1iv(target.location, nums))
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
          assert(res.array_buffer, 'need to bind gl.ARRAY_BUFFER to call gl.vertexAttribPointer. ');
          this.buffer = res.array_buffer; // ! assign from current array_buffer
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
      element_array_buffer: null as WebGLBuffer | null,
      element_array_buffer__private_index_type: null as
        | null
        | 'UNSIGNED_BYTE'
        | 'UNSIGNED_SHORT'
        | 'UNSIGNED_INT',
      get element_array_buffer_() {
        assert(vertext_array.element_array_buffer);
        return {
          data(opt: {
            data: Uint32Array | Uint16Array | Uint8Array;
            usage?: 'STATIC_DRAW' | 'DYNAMIC_DRAW' | 'STREAM_DRAW';
          }) {
            assert(vertext_array.element_array_buffer);
            vertext_array.element_array_buffer__private_index_type =
              (
                [
                  [Uint8Array, 'UNSIGNED_BYTE'],
                  [Uint16Array, 'UNSIGNED_SHORT'],
                  [Uint32Array, 'UNSIGNED_INT'],
                ] as const
              ).find(f => opt.data instanceof f[0])?.[1] ?? null;

            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, opt.data, gl[opt.usage ?? 'STATIC_DRAW']);
          },
          get index_type() {
            assert(vertext_array.element_array_buffer);
            return vertext_array.element_array_buffer__private_index_type;
          },
        };
      },
    },
    {
      set(t, p, val) {
        // if (typeof p === 'string' && p.includes('private')) return false;
        if (p === 'element_array_buffer') {
          if (p === null || val instanceof WebGLBuffer) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, val);
          } else {
            return false;
          }
        }
        return Reflect.set(t, p, val);
      },
    }
  );

  const res = new Proxy(
    {
      get gl() {
        return gl;
      },
      /** allow to inspect gl behavior */
      get inspect() {
        return _inspect;
      },
      set inspect(enable: boolean) {
        if (_inspect != enable) {
          console.info(
            enable
              ? `${LOG_COLOR.fg.magenta}gl:${LOG_COLOR.reset} turn ${LOG_COLOR.fg.green}ON${LOG_COLOR.reset} inspector`
              : `${LOG_COLOR.fg.magenta}gl:${LOG_COLOR.reset} turn ${LOG_COLOR.fg.red}OFF${LOG_COLOR.reset} inspector`
          );
        }
        _inspect = enable;
      },
      get program() {
        return program;
      },
      array_buffer: null as WebGLBuffer | null,
      get array_buffer_() {
        return {
          // alias for `.array_buffer = $1`
          bind(array_buffer: WebGLBuffer | null) {
            res.array_buffer = array_buffer;
            return this;
          },
          /** @proxy @type {gl.bufferData} */
          data({
            data,
            usage = 'STATIC_DRAW',
            offset = 0,
            length = 0,
          }: {
            data: TypedArray;
            usage?: 'STATIC_DRAW' | 'DYNAMIC_DRAW' | 'STREAM_DRAW';
            offset?: number;
            length?: number;
          }) {
            assert(res.array_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl[usage], offset, length);
          },
        };
      },
      set array_buffer_data(opt: {
        data: TypedArray;
        usage?: 'STATIC_DRAW' | 'DYNAMIC_DRAW' | 'STREAM_DRAW';
        offset?: number;
        length?: number;
      }) {
        assert(res.array_buffer);
        const { data, usage = 'STATIC_DRAW', offset = 0, length = undefined } = opt;
        gl.bufferData(gl.ARRAY_BUFFER, data, gl[usage], offset ?? 0, length);
      },
      /** bind to current texture_2d_active_index */
      texture_2d: null as WebGLTexture | null,
      /** will call @type {gl.activeTexture} */
      texture_2d_active_index: 0,
      get texture_2d_() {
        return {
          bind(texture: WebGLTexture | null) {
            res.texture_2d = texture;
            return this;
          },
          /** `gl.activeTexture($1)` */
          active(idx: number) {
            assert(gl.TEXTURE0 + 15 === gl.TEXTURE15); // magic wewbgl
            res.texture_2d_active_index = idx;
            return this;
          },
          /** `gl.texImage2D(TEXTURE_2D, 0, RGBA, RGBA, UNSIGNED_BYTE, $1)` */
          data(opt: {
            data: ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
          }) {
            assert(res.texture_2d);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, opt.data);
            this.minmag('LINEAR');
            this.wrap('REPEAT');
            return this;
          },
          /** must call before call @type {gl.texImage2D} to take effect
           * `gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, $1)`
           */
          flip_y(flip: boolean) {
            assert(!res.texture_2d, 'must call before call @type {gl.texImage2D} to take effect');
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flip);
            return this;
          },
          /** `gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S/T`, $1) */
          wrap(opt: 'REPEAT' | 'CLAMP_TO_EDGE' | 'MIRRORED_REPEAT') {
            assert(res.texture_2d);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[opt]);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[opt]);
            return this;
          },
          /** `gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN/MAG_FILTER`, $1) */
          minmag(opt: 'NEAREST' | 'LINEAR' | 'NEAREST_MIPMAP_LINEAR') {
            assert(res.texture_2d);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[opt]);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[opt]);
            return this;
          },
        };
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
      draw_element(opt: { mode: 'TRIANGLES' | 'POINTS'; count: number; offset?: number }) {
        assert(res.vertext_array.element_array_buffer);
        assert(res.vertext_array.element_array_buffer_.index_type);
        gl.drawElements(
          gl[opt.mode],
          opt.count,
          gl[res.vertext_array.element_array_buffer_.index_type],
          opt.offset ?? 0
        );
      },
      draw_element_instanced(opt: {
        mode: 'TRIANGLES' | 'POINTS';
        count: number;
        instance_count: number;
        offset?: number;
      }) {
        assert(res.vertext_array.element_array_buffer);
        assert(res.vertext_array.element_array_buffer_.index_type);
        gl.drawElementsInstanced(
          gl[opt.mode],
          opt.count ?? 0,
          gl[res.vertext_array.element_array_buffer_.index_type],
          opt.offset ?? 0,
          opt.instance_count
        );
      },
    },
    {
      // get(t, f) {
      //   return deproxy_get(t, f);
      // },
      set(target, field, new_val, old_val) {
        if (field == 'array_buffer') {
          assert(new_val === null || new_val instanceof WebGLBuffer);
          gl.bindBuffer(gl.ARRAY_BUFFER, new_val);
        }
        if (field == 'texture_2d') {
          assert(new_val === null || new_val instanceof WebGLTexture);
          gl.bindTexture(gl.TEXTURE_2D, new_val);
        }
        if (field == 'texture_2d_active_index') {
          assert(typeof new_val == 'number');
          assert(gl.TEXTURE0 + 15 === gl.TEXTURE15); // magic wewbgl
          gl.activeTexture(gl.TEXTURE0 + new_val);
        }
        return Reflect.set(target, field, new_val, old_val);
      },
    }
  );

  // @ts-expect-error
  window['proxygl'] = res;
  return res;
}
