#version 300 es
precision highp float;

in vec2 v_corner;
in vec4 v_color;
in float v_life;
flat in float v_shape;  // flat — discrete integer, no interpolation

out vec4 fragColor;

void main() {
  float alpha = v_color.a * v_life;

  // Circle shape — discard outside radius
  if (v_shape > 0.5 && v_shape < 1.5) {
    float dist = length(v_corner);
    if (dist > 1.0) discard;
    alpha *= smoothstep(1.0, 0.6, dist);
  }

  // Line shape — thin stroke
  if (v_shape > 1.5) {
    float dist = abs(v_corner.y);
    if (dist > 0.3) discard;
    alpha *= smoothstep(0.3, 0.0, dist);
  }

  fragColor = vec4(v_color.rgb, alpha);
}
