// prettier-ignore
export const TYPECONVERT = {
  "float": { glsl_type: "float", base_type: "FLOAT", element_size: 4, element_count: 1,  size_in_byte: 4,  gl_setter_abbr: "1f",          gl_setter_uniform: "uniform1f",        gl_setter_attr: "vertexAttrib1f"  },
  "vec2":  { glsl_type: "vec2",  base_type: "FLOAT", element_size: 4, element_count: 2,  size_in_byte: 8,  gl_setter_abbr: "2f",          gl_setter_uniform: "uniform2f",        gl_setter_attr: "vertexAttrib2f"  },
  "vec3":  { glsl_type: "vec3",  base_type: "FLOAT", element_size: 4, element_count: 3,  size_in_byte: 12, gl_setter_abbr: "3f",          gl_setter_uniform: "uniform3f",        gl_setter_attr: "vertexAttrib3f"  },
  "vec4":  { glsl_type: "vec4",  base_type: "FLOAT", element_size: 4, element_count: 4,  size_in_byte: 16, gl_setter_abbr: "4f",          gl_setter_uniform: "uniform4f",        gl_setter_attr: "vertexAttrib4f"  },
  "int":   { glsl_type: "int",   base_type: "INT",   element_size: 4, element_count: 1,  size_in_byte: 4,  gl_setter_abbr: null as never, gl_setter_uniform: "uniform4f",        gl_setter_attr: null as never     },
  "bool":  { glsl_type: "bool",  base_type: "BOOL",  element_size: 1, element_count: 1,  size_in_byte: 1,  gl_setter_abbr: null as never, gl_setter_uniform: "uniform4f",        gl_setter_attr: null as never     },
  "mat3":  { glsl_type: "mat3",  base_type: "FLOAT", element_size: 4, element_count: 9,  size_in_byte: 36, gl_setter_abbr: "3fv",         gl_setter_uniform: "uniformMatrix3fv", gl_setter_attr: "vertexAttrib3fv" },
  "mat4":  { glsl_type: "mat4",  base_type: "FLOAT", element_size: 4, element_count: 16, size_in_byte: 64, gl_setter_abbr: "4fv",         gl_setter_uniform: "uniformMatrix4fv", gl_setter_attr: "vertexAttrib4fv" },
} as const;

export type KrGlslVarInfoType = typeof TYPECONVERT;
export type KrGlslVarType = keyof typeof TYPECONVERT;
