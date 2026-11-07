(() => {
  'use strict';
  const canvas = document.querySelector('#chrome');
  const gl = canvas.getContext('webgl', {alpha:false, antialias:false, powerPreference:'low-power'});
  if (!gl) return;
  const vertex = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fragment = `
    precision mediump float;
    uniform vec2 size;
    uniform float time;
    void main() {
      vec2 p = (gl_FragCoord.xy / size.xy - .5) * vec2(size.x / size.y, 1.0);
      float t = time * .055;
      float warp = sin(p.x * 3.1 + cos(p.y * 4.2 + t)) + cos(p.y * 5. + sin(p.x * 3. - t));
      warp += sin(p.x * 29. + sin(p.y * 19.) + t) * .09;
      float ridge = sin(p.x * 10. + p.y * 13. + warp * 5. + t);
      float sheen = abs(sin(ridge * 2. + warp));
      float light = .15 + .55 * sheen + .4 * pow(sheen, 20.);
      float scratches = sin(p.y * 90. + p.x * 15. + warp * 18.);
      vec3 metal = mix(vec3(.12,.17,.19), vec3(.78,.77,.82), light);
      vec3 ink = .5 + .5 * cos(vec3(0.,2.2,4.6) + warp * 2. + p.y * 3. - t);
      float spill = smoothstep(.05,.8,sin(p.x * 1.8 - p.y * 2. + t));
      metal = mix(metal, ink * vec3(1.,.32,.9), spill * .68);
      metal += scratches * .025;
      gl_FragColor = vec4(metal,1.);
    }`;
  function shader(type, source) {
    const result = gl.createShader(type);
    gl.shaderSource(result, source);
    gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) return null;
    return result;
  }
  const vs = shader(gl.VERTEX_SHADER, vertex);
  const fs = shader(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) return;
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const size = gl.getUniformLocation(program, 'size');
  const time = gl.getUniformLocation(program, 'time');
  function resize() {
    canvas.width = Math.min(innerWidth, 1000);
    canvas.height = Math.round(canvas.width * innerHeight / innerWidth);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(size, canvas.width, canvas.height);
  }
  resize();
  addEventListener('resize', resize);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let last = 0;
  function draw(now) {
    if (!document.hidden && now - last > 70) {
      gl.uniform1f(time, now / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      last = now;
    }
    if (!reduced) requestAnimationFrame(draw);
  }
  draw(100);
})();
