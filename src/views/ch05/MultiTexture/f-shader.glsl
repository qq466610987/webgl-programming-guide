precision mediump float;// 声明中精度，必须声明不然会编译报错
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1; // 新增：多采样器
varying vec2 v_TexCoord;
void main() {
  // 新增，颜色混合
  vec4 color0 = texture2D(u_Sampler0, v_TexCoord);
  vec4 color1 = texture2D(u_Sampler1, v_TexCoord);
  gl_FragColor = color0 * color1;
}