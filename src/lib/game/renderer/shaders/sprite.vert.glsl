#version 300 es
precision highp float;

// Per-vertex quad corners (0,0) (1,0) (0,1) (1,1)
layout(location = 0) in vec2 a_corner;

// Per-instance attributes
layout(location = 1) in vec4 a_posSize;   // xy = world pos, zw = width/height
layout(location = 2) in vec4 a_uvRect;    // xy = uv min, zw = uv max
layout(location = 3) in vec4 a_tint;      // rgba tint color
layout(location = 4) in float a_flags;    // bit 0 = flipH

uniform mat4 u_projection;

out vec2 v_uv;
out vec4 v_tint;

void main() {
  vec2 corner = a_corner;

  // Flip horizontally if flag is set
  float flipH = mod(a_flags, 2.0);
  if (flipH > 0.5) {
    corner.x = 1.0 - corner.x;
  }

  // Interpolate UV using flipped corner so texture mirrors correctly
  v_uv = mix(a_uvRect.xy, a_uvRect.zw, corner);
  v_tint = a_tint;

  // World position (uses original corner — flip only affects UV)
  vec2 pos = a_posSize.xy + a_corner * a_posSize.zw;
  gl_Position = u_projection * vec4(pos, 0.0, 1.0);
}
