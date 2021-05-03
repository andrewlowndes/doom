uniform mat4 modelViewProj;

attribute vec3 aPosition;

void main(void) {
  gl_Position = modelViewProj * vec4(aPosition, 1.0);
}
