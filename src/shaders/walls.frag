precision mediump float;

uniform bool shouldClip;
uniform sampler2D tex;
uniform float lightIntensity;

varying vec3 vPos;
varying vec2 vUv;

void main(void) {
  if (shouldClip && (vUv.y > 1.0 || vUv.y < 0.0)) {
    discard;
  }

  vec4 col = texture2D(tex, vUv);
  
  if (col.a < 0.1) {
    discard;
  }
  
  //fake distance-based darkening
  float fakeDepthLighting = clamp(gl_FragCoord.w * 500.0, 0.0, 1.0);
  
  gl_FragColor = vec4(col.xyz * lightIntensity * fakeDepthLighting, 1.0);
}
