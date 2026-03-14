#version 300 es
precision highp float;

in vec2 v_uv;
uniform sampler2D u_texture;
uniform vec2 u_texelSize; // 1.0 / resolution

out vec4 fragColor;

void main() {
  // Dual-filter downsample: 4 bilinear taps at half-pixel offsets
  // Leverages LINEAR filtering for effective 13-tap coverage
  vec2 halfTexel = u_texelSize * 0.5;

  vec3 sum = texture(u_texture, v_uv + vec2(-halfTexel.x, -halfTexel.y)).rgb;
  sum += texture(u_texture, v_uv + vec2( halfTexel.x, -halfTexel.y)).rgb;
  sum += texture(u_texture, v_uv + vec2(-halfTexel.x,  halfTexel.y)).rgb;
  sum += texture(u_texture, v_uv + vec2( halfTexel.x,  halfTexel.y)).rgb;

  fragColor = vec4(sum * 0.25, 1.0);
}
