"use client";

import { useEffect, useRef } from "react";

export function Atmosphere() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const gl = element.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!gl) return;
    const shaders: WebGLShader[] = [];
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vertex = compile(gl.VERTEX_SHADER, "attribute vec2 p; varying vec2 uv; void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}");
    const fragment = compile(gl.FRAGMENT_SHADER, `precision mediump float; varying vec2 uv; uniform float t;
      void main(){vec2 p=uv;float wave=sin(p.x*5.+t*.07)*.12+sin(p.x*9.-t*.04)*.04;
      float haze=exp(-abs(p.y-.48-wave)*9.)*.22;
      vec3 color=mix(vec3(.12,.30,.38),vec3(.36,.24,.48),p.x);
      gl_FragColor=vec4(color,haze);}`);
    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    let frame = 0;
    if (vertex && fragment && program && buffer) {
      gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
      if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.useProgram(program); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
        const attribute = gl.getAttribLocation(program, "p");
        gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
        const time = gl.getUniformLocation(program, "t");
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        const draw = (now: number) => {
          const width = Math.min(element.clientWidth, 1440);
          const height = Math.min(element.clientHeight, 900);
          if (element.width !== width || element.height !== height) { element.width = width; element.height = height; }
          gl.viewport(0, 0, element.width, element.height);
          if (!document.hidden) { gl.uniform1f(time, reduced.matches ? 0 : now / 1000); gl.drawArrays(gl.TRIANGLES, 0, 6); }
          frame = requestAnimationFrame(draw);
        };
        frame = requestAnimationFrame(draw);
      }
    }
    return () => {
      cancelAnimationFrame(frame);
      shaders.forEach((shader) => gl.deleteShader(shader));
      gl.deleteBuffer(buffer); gl.deleteProgram(program);
    };
  }, []);
  return <canvas ref={canvas} className="cosmic-atmosphere" aria-hidden="true" />;
}
