precision mediump float;// 声明中精度，必须声明不然会编译报错
uniform float u_width;
uniform float u_height;
void main() {
  gl_FragColor = vec4(gl_FragCoord.x / u_width, 0.0, gl_FragCoord.y / u_height, 1.0);
}