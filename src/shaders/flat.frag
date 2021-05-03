precision mediump float;

uniform sampler2D tex;
uniform float lightIntensity;

varying vec2 vPos;

const float flatSize = 64.0;

void main(void) {
  //FIXME: better to interpolate over uv coords?
  vec4 texVal = texture2D(tex, fract(vPos / flatSize));
  
  //fake distance-based darkening
  float fakeDepthLighting = clamp(gl_FragCoord.w * 500.0, 0.0, 1.0);
  
  gl_FragColor = vec4(texVal.xyz * lightIntensity * fakeDepthLighting, 1.0);
}
