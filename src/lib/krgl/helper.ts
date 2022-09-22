/** @pure */
import { range } from "lodash-es";
import { gl_parameter_name } from "../sgl/helper";
import { sync_pipe } from "ts-async-pipe";
export function assert<T>(cond: T, message = "assert error"): asserts cond {
  if (!cond) {
    throw new Error(message);
  }
}

/** @pure */
export function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

/** @pure */
export function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) {
  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function computeActiveAttrAndUniformInfo<
  VS extends string = string,
  FS extends string = string
>(gl: WebGL2RenderingContext, program: WebGLProgram) {
  const attr = sync_pipe(
    range(gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)),
    (o) => o.map((i) => gl.getActiveAttrib(program, i)!)
  );
  const unif = sync_pipe(
    range(gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)),
    (o) => o.map((i) => gl.getActiveUniform(program, i)!)
  );

  const [a, u] = [attr, unif].map((arr) => {
    return arr.map((info, i) => {
      return {
        location: i,
        name: info.name.replace("[0]", ""),
        size: info.size,
        type: gl_parameter_name(gl, info.type),
      };
    });
  });

  return {
    active_attributes: a,
    active_uniforms: u,
  };
}
