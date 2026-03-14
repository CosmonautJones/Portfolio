#version 300 es
precision highp float;

// Per-vertex quad corner
layout(location = 0) in vec2 a_corner;

// Per-instance
layout(location = 1) in vec2 a_position;    // world xy
layout(location = 2) in vec2 a_sizeLife;     // x = size, y = life/maxLife (0..1)
layout(location = 3) in vec4 a_color;        // rgba
layout(location = 4) in float a_shape;       // 0 = square, 1 = circle, 2 = line
layout(location = 5) in float a_rotation;    // radians (for line shape)

uniform mat4 u_projection;

out vec2 v_corner;
out vec4 v_color;
out float v_life;
flat out float v_shape;  // flat — discrete integer, no interpolation

void main() {
  float size = a_sizeLife.x;
  v_life = a_sizeLife.y;
  v_color = a_color;
  v_corner = a_corner * 2.0 - 1.0; // -1..1
  v_shape = a_shape;

  // Rotate corner for line particles
  vec2 offset = (a_corner - 0.5) * size;
  if (a_shape > 1.5) {
    float c = cos(a_rotation);
    float s = sin(a_rotation);
    offset = vec2(offset.x * c - offset.y * s, offset.x * s + offset.y * c);
  }

  vec2 pos = a_position + offset;
  gl_Position = u_projection * vec4(pos, 0.0, 1.0);
}
