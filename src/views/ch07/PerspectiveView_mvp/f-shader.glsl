precision mediump float;// 声明中精度，必须声明不然会编译报错
varying vec4 v_Color;
void main() {
  gl_FragColor = v_Color;
}