#version 300 es
precision highp float;

in vec2 v_uv;
uniform sampler2D u_texture;
uniform vec2 u_texelSize; // 1.0 / resolution

out vec4 fragColor;

void main() {
  // Dual-filter upsample: 8 bilinear taps in tent filter pattern
  vec2 ts = u_texelSize;

  vec3 sum = texture(u_texture, v_uv + vec2(-ts.x, -ts.y)).rgb;
  sum += texture(u_texture, v_uv + vec2( 0.0,  -ts.y)).rgb * 2.0;
  sum += texture(u_texture, v_uv + vec2( ts.x, -ts.y)).rgb;
  sum += texture(u_texture, v_uv + vec2(-ts.x,  0.0)).rgb * 2.0;
  sum += texture(u_texture, v_uv + vec2( ts.x,  0.0)).rgb * 2.0;
  sum += texture(u_texture, v_uv + vec2(-ts.x,  ts.y)).rgb;
  sum += texture(u_texture, v_uv + vec2( 0.0,   ts.y)).rgb * 2.0;
  sum += texture(u_texture, v_uv + vec2( ts.x,  ts.y)).rgb;

  fragColor = vec4(sum / 12.0, 1.0);
}
