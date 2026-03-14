#version 300 es
precision highp float;

in vec2 v_uv;

uniform sampler2D u_scene;
uniform sampler2D u_lightMap;

out vec4 fragColor;

void main() {
  vec3 scene = texture(u_scene, v_uv).rgb;
  vec3 light = texture(u_lightMap, v_uv).rgb;

  // Multiply scene by light map (2x to allow over-brightening)
  fragColor = vec4(scene * light * 2.0, 1.0);
}
