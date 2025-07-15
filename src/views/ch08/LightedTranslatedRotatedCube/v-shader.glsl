attribute vec4 a_Position;
attribute vec4 a_Color;
varying vec4 v_Color;
attribute vec4 a_Normal; // 法向量
uniform mat4 u_mvpMatrix;
uniform vec3 u_LightColor; // 光源颜色
uniform vec3 u_LightDirection; // 归一化后的光源方向
uniform vec3 u_AmbientLight; // 环境光
uniform mat4 u_NormalMatrix; // ✅新增：用来变换法向量的矩阵

void main() {
  gl_Position = u_mvpMatrix * a_Position;
  // 对法向量进行归一化处理
  // ✅新增：使用u_NormalMatrix来变换法向量
  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
  // 计算光线方向和法向量的点积
  float nDotL = max(dot(u_LightDirection, normal), 0.0);
  // 计算漫反射光的颜色
  vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;
  // 计算环境光颜色
  vec3 ambient = u_AmbientLight * vec3(a_Color);
  v_Color = vec4(diffuse + ambient, a_Color.a);
}