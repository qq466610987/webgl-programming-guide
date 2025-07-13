attribute vec4 a_Position;
attribute vec4 a_Color;
varying vec4 v_Color;
attribute vec4 a_Normal; // 新增： 法向量
uniform mat4 u_mvpMatrix;
uniform vec3 u_LightColor; // 新增：光源颜色
uniform vec3 u_LightDirection; // 新增：归一化后的光源方向

void main() {
  gl_Position = u_mvpMatrix * a_Position;
  // 对法向量进行归一化处理
  vec3 normal = normalize(vec3(a_Normal));
  // 计算光线方向和法向量的点积
  float nDotL = max(dot(u_LightDirection, normal), 0.0);
  // 计算漫反射光的颜色
  vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;
  v_Color = vec4(diffuse, a_Color.a);
}