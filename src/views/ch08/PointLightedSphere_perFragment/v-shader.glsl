attribute vec4 a_Position;
attribute vec4 a_Normal;

uniform mat4 u_MvpMatrix;
uniform mat4 u_ModelMatrix;   // 模型矩阵
uniform mat4 u_NormalMatrix;  // 用于变换法向量的矩阵

varying vec3 v_Normal;
varying vec3 v_Position;
varying vec4 v_Color;

void main() {
  // 统一使用白色作为物体基色
  v_Color = vec4(1.0, 1.0, 1.0, 1.0);

  // 计算裁剪空间坐标
  gl_Position = u_MvpMatrix * a_Position;

  // 将顶点坐标变换到世界空间后传递给片元着色器
  v_Position = vec3(u_ModelMatrix * a_Position);

  // 将法向量变换到世界空间并归一化后传递
  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
}