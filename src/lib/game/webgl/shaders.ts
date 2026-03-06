// ============================================================================
// WebGL2 GLSL Shader Sources — ClaudeBot's Adventure GPU Renderer
// ============================================================================

// ---------------------------------------------------------------------------
// Sprite Batch Shader — renders textured/tinted quads from a sprite atlas
// Supports per-instance: position, size, UV region, tint RGBA, flip
// ---------------------------------------------------------------------------

export const SPRITE_VERTEX = /* glsl */ `#version 300 es
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
`;

export const SPRITE_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
in vec4 v_tint;

uniform sampler2D u_atlas;

out vec4 fragColor;

void main() {
  vec4 texel = texture(u_atlas, v_uv);
  if (texel.a < 0.01) discard;
  fragColor = texel * v_tint;
}
`;

// ---------------------------------------------------------------------------
// Solid Quad Shader — renders colored quads (no texture) for ground strips,
// transitions, shadows, etc. Supports per-vertex color for gradients.
// ---------------------------------------------------------------------------

export const QUAD_VERTEX = /* glsl */ `#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec4 a_color;

uniform mat4 u_projection;

out vec4 v_color;

void main() {
  v_color = a_color;
  gl_Position = u_projection * vec4(a_position, 0.0, 1.0);
}
`;

export const QUAD_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

in vec4 v_color;
out vec4 fragColor;

void main() {
  fragColor = v_color;
}
`;

// ---------------------------------------------------------------------------
// GPU Particle Shader — instanced point/quad particles with color & life
// ---------------------------------------------------------------------------

export const PARTICLE_VERTEX = /* glsl */ `#version 300 es
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
`;

export const PARTICLE_FRAGMENT = /* glsl */ `#version 300 es
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
`;

// ---------------------------------------------------------------------------
// Background Shader — procedural sky gradient with aurora shimmer and stars
// ---------------------------------------------------------------------------

export const BACKGROUND_VERTEX = /* glsl */ `#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const BACKGROUND_FRAGMENT = /* glsl */ `#version 300 es
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

  // Deep sky gradient
  float pulse = sin(u_time * 0.15) * 0.03;
  vec3 topColor = vec3(8.0, 5.0, 22.0) / 255.0;
  vec3 midColor = vec3(15.0, 12.0, 38.0) / 255.0;
  vec3 baseColor = vec3(26.0, 28.0, 44.0) / 255.0;

  float t = uv.y; // 0 = top, 1 = bottom
  vec3 sky;
  if (t < 0.3 + pulse) {
    sky = mix(topColor, midColor, t / (0.3 + pulse));
  } else if (t < 0.45) {
    sky = mix(midColor, baseColor, (t - 0.3 - pulse) / (0.15 - pulse));
  } else {
    sky = baseColor;
  }

  // Aurora bands — three horizontal shimmer blobs near top
  if (t < 0.2) {
    float auroraPhase = u_time * 0.08;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float cx = 0.3 + fi * 0.2 + sin(auroraPhase + fi * 1.2) * 0.15;
      float dist = length(vec2(uv.x - cx, (uv.y - 0.08) * 4.0));
      float glow = exp(-dist * dist * 8.0);
      float alpha = 0.015 + 0.01 * sin(auroraPhase * 1.3 + fi);
      vec3 auroraColor = mix(
        vec3(115.0, 239.0, 247.0) / 255.0,
        vec3(59.0, 93.0, 201.0) / 255.0,
        dist
      );
      sky += auroraColor * glow * alpha;
    }
  }

  // Star field
  if (t < 0.35) {
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
`;

// ---------------------------------------------------------------------------
// Post-Processing — Bloom extraction, Gaussian blur, and final composite
// ---------------------------------------------------------------------------

export const BLOOM_EXTRACT_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
uniform sampler2D u_scene;
uniform float u_threshold;

out vec4 fragColor;

void main() {
  vec4 color = texture(u_scene, v_uv);
  float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
  if (brightness > u_threshold) {
    fragColor = vec4(color.rgb * (brightness - u_threshold), 1.0);
  } else {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
}
`;

export const BLUR_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
uniform sampler2D u_texture;
uniform vec2 u_direction; // (1/width, 0) or (0, 1/height)

out vec4 fragColor;

void main() {
  // 9-tap Gaussian blur
  float weights[5] = float[](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

  vec3 result = texture(u_texture, v_uv).rgb * weights[0];
  for (int i = 1; i < 5; i++) {
    vec2 offset = u_direction * float(i);
    result += texture(u_texture, v_uv + offset).rgb * weights[i];
    result += texture(u_texture, v_uv - offset).rgb * weights[i];
  }

  fragColor = vec4(result, 1.0);
}
`;

export const COMPOSITE_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
uniform sampler2D u_scene;
uniform sampler2D u_bloom;
uniform float u_bloomIntensity;
uniform float u_time;
uniform vec2 u_resolution;

out vec4 fragColor;

void main() {
  vec2 uv = v_uv;

  // Chromatic aberration — subtle RGB channel offset from center
  float aberration = 0.001 + 0.0003 * sin(u_time * 0.3);
  vec2 dir = uv - 0.5;
  float dist = length(dir);
  vec2 offset = dir * dist * aberration;

  float r = texture(u_scene, uv + offset).r;
  float g = texture(u_scene, uv).g;
  float b = texture(u_scene, uv - offset).b;
  vec3 scene = vec3(r, g, b);

  // Add bloom
  vec3 bloom = texture(u_bloom, uv).rgb;
  scene += bloom * u_bloomIntensity;

  // Warm inner glow — subtle amber bloom at center
  float glowAlpha = 0.04 + 0.015 * sin(u_time * 0.4);
  float glowDist = length((uv - vec2(0.5, 0.55)) * vec2(1.0, u_resolution.x / u_resolution.y));
  float glowMask = exp(-glowDist * glowDist * 12.0);
  scene += vec3(239.0, 125.0, 87.0) / 255.0 * glowMask * glowAlpha;

  // Vignette — darkens edges
  float vigDist = length(uv - 0.5) * 1.4;
  float vig = smoothstep(0.3, 0.8, vigDist);
  scene *= 1.0 - vig * 0.32;

  // Scanline hint — very subtle for retro feel
  float scanline = sin(uv.y * u_resolution.y * 1.5) * 0.02 + 1.0;
  scene *= scanline;

  fragColor = vec4(scene, 1.0);
}
`;

// Shared fullscreen vertex shader for post-processing
export const FULLSCREEN_VERTEX = BACKGROUND_VERTEX;
