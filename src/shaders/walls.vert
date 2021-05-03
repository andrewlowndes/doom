uniform mat4 modelViewProj;

attribute vec3 aPosition;
attribute vec2 aUv;

varying vec3 vPos;
varying vec2 vUv;

void main(void) {
  vPos = aPosition;
  vUv = aUv;
  gl_Position = modelViewProj * vec4(aPosition, 1.0);
}
