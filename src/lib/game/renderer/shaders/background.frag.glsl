#version 300 es
precision highp float;

in vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;

out vec4 fragColor;

// Simple hash for procedural noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = v_uv;

  // Clean navy sky gradient — no purple tint
  vec3 topColor = vec3(10.0, 22.0, 40.0) / 255.0;   // #0a1628
  vec3 baseColor = vec3(15.0, 36.0, 64.0) / 255.0;   // #0f2440

  float t = uv.y; // 0 = top, 1 = bottom
  vec3 sky = mix(topColor, baseColor, smoothstep(0.0, 0.5, t));

  // LOD: Aurora only runs for top 40% of screen
  if (t < 0.2) {
    float auroraPhase = u_time * 0.08;
    for (int i = 0; i < 2; i++) {
      float fi = float(i);
      float cx = 0.35 + fi * 0.3 + sin(auroraPhase + fi * 1.5) * 0.12;
      float dist = length(vec2(uv.x - cx, (uv.y - 0.08) * 4.0));
      float glow = exp(-dist * dist * 8.0);
      float alpha = 0.012 + 0.006 * sin(auroraPhase * 1.3 + fi);
      vec3 auroraColor = mix(
        vec3(80.0, 180.0, 220.0) / 255.0,
        vec3(50.0, 100.0, 180.0) / 255.0,
        dist
      );
      sky += auroraColor * glow * alpha;
    }
  }

  // LOD: Star field only runs for top 60% of screen (bottom is plain gradient)
  if (t < 0.6) {
    vec2 starGrid = floor(uv * vec2(40.0, 20.0));
    float starRand = hash(starGrid);
    if (starRand > 0.92) {
      vec2 starCenter = (starGrid + 0.5) / vec2(40.0, 20.0);
      float starDist = length((uv - starCenter) * vec2(40.0, 20.0));
      if (starDist < 0.5) {
        float twinkle = 0.6 + 0.4 * sin(u_time * (1.5 + starRand * 3.0) + starRand * 6.28);
        float starAlpha = (0.12 + starRand * 0.3) * twinkle * smoothstep(0.5, 0.0, starDist);
        sky += vec3(0.96) * starAlpha;
      }
    }
  }

  fragColor = vec4(sky, 1.0);
}
