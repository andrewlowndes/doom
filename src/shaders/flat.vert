uniform mat4 modelViewProj;

attribute vec3 aPosition;
varying vec2 vPos;

void main(void) {
  vPos = aPosition.xz;
  gl_Position = modelViewProj * vec4(aPosition, 1.0);
}
