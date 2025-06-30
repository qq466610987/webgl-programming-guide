attribute vec4 a_Position;
uniform float u_cosB, u_sinB;
void main() {
  gl_Position.x = a_Position.x * u_cosB - a_Position.y * u_sinB;
  gl_Position.y = a_Position.x * u_sinB + a_Position.y * u_cosB;
  gl_Position.z = a_Position.z;
  gl_Position.w = 1.0;
}