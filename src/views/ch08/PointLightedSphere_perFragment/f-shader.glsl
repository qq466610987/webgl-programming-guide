precision mediump float;

uniform vec3 u_LightColor;    // 光源颜色
uniform vec3 u_LightPosition; // 光源位置
uniform vec3 u_AmbientLight;  // 环境光颜色

varying vec3 v_Normal;
varying vec3 v_Position;
varying vec4 v_Color;

void main() {
  // 对插值后的法向量进行归一化
  vec3 normal = normalize(v_Normal);

  // 计算光线方向并归一化
  vec3 lightDirection = normalize(u_LightPosition - v_Position);

  // 计算光线方向和法向量的点积（漫反射系数）
  float nDotL = max(dot(lightDirection, normal), 0.0);

  // 漫反射分量
  vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;

  // 环境光分量
  vec3 ambient = u_AmbientLight * v_Color.rgb;

  // 最终颜色
  gl_FragColor = vec4(diffuse + ambient, v_Color.a);
}