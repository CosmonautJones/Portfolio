#version 300 es
precision highp float;

in vec2 v_uv;
in vec4 v_tint;

uniform sampler2D u_atlas;

out vec4 fragColor;

void main() {
  vec4 texel = texture(u_atlas, v_uv);
  // Pre-multiplied alpha — avoids discard which breaks early-Z on batched sprites
  fragColor = vec4(texel.rgb * texel.a * v_tint.rgb, texel.a * v_tint.a);
}
