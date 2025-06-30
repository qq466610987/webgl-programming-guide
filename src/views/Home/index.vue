<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { routes } from '@/router'

const router = useRouter()

// 从路由配置中提取章节结构
const chapters = computed(() => {
  const chapterMap = new Map()

  routes.forEach((route) => {
    if (route.path === '/')
      return // 跳过首页路由

    const match = route.path.match(/^\/ch(\d+)\/(.+)$/)
    if (match) {
      const chapterNum = Number.parseInt(match[1])
      const demoName = match[2]

      if (!chapterMap.has(chapterNum)) {
        chapterMap.set(chapterNum, {
          chapter: chapterNum,
          title: `第${chapterNum}章`,
          demos: [],
        })
      }

      chapterMap.get(chapterNum).demos.push({
        name: demoName,
        path: route.path,
        description: (route as any).meta?.description || `${demoName} 示例`,
        // 生成图片路径
        imagePath: new URL(`../ch${chapterNum.toString().padStart(2, '0')}/${demoName}/index.png`, import.meta.url),
      })
    }
  })

  // 按章节号排序
  return Array.from(chapterMap.values()).sort((a, b) => a.chapter - b.chapter)
})

function navigateToDemo(path: string) {
  router.push(path)
}

// 处理图片加载错误
function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  // 设置默认占位图片或渐变背景
  img.style.display = 'none'
  const parent = img.parentElement
  if (parent) {
    parent.style.background = 'linear-gradient(45deg, #f0f0f0, #e0e0e0)'
    parent.innerHTML += '<div class="no-image-text">暂无预览</div>'
  }
}
</script>

<template>
  <div class="home-container">
    <div class="header">
      <h1>WebGL编程指南 - 学习Demo</h1>
      <p>选择你想要查看的章节和案例</p>
    </div>

    <div class="chapters">
      <div v-for="chapter in chapters" :key="chapter.chapter" class="chapter-section">
        <h2>{{ chapter.title }}</h2>
        <div class="demos-grid">
          <div v-for="demo in chapter.demos" :key="demo.path" class="demo-card" @click="navigateToDemo(demo.path)">
            <div class="demo-preview">
              <img :src="demo.imagePath" :alt="`${demo.name} 预览图`" class="preview-image" @error="handleImageError">
              <div class="overlay">
                <span class="play-icon">▶</span>
              </div>
            </div>
            <div class="demo-info">
              <h3>{{ demo.name }}</h3>
              <p>{{ demo.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem 4rem;
  overflow: auto;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 4rem;
}

.header h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.header p {
  font-size: 1.4rem;
  opacity: 0.9;
  font-weight: 300;
}

.chapters {
  max-width: 1600px;
  margin: 0 auto;
}

.chapter-section {
  margin-bottom: 4rem;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.chapter-section h2 {
  color: #333;
  margin-bottom: 2.5rem;
  font-size: 2.2rem;
  font-weight: 600;
  border-bottom: 4px solid #667eea;
  padding-bottom: 0.8rem;
  letter-spacing: -0.3px;
}

.demos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 2.5rem;
  justify-items: stretch;
}

.demo-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.demo-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 35px rgba(0, 0, 0, 0.2);
  border-color: #667eea;
}

.demo-preview {
  position: relative;
  height: 240px;
  background: linear-gradient(45deg, #f8f9fa, #e9ecef);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.demo-card:hover .preview-image {
  transform: scale(1.05);
}

.no-image-text {
  position: absolute;
  color: #6c757d;
  font-size: 1rem;
  font-weight: 500;
  pointer-events: none;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(2px);
}

.demo-card:hover .overlay {
  opacity: 1;
}

.play-icon {
  color: white;
  font-size: 3rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.demo-info {
  padding: 1.8rem;
  background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
}

.demo-info h3 {
  margin: 0 0 0.8rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 1.3;
}

.demo-info p {
  margin: 0;
  color: #5a6c7d;
  font-size: 1rem;
  line-height: 1.5;
  font-weight: 400;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .demos-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
  }

  .chapters {
    max-width: 1400px;
  }
}

@media (max-width: 1200px) {
  .demos-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.8rem;
  }

  .home-container {
    padding: 2rem 3rem;
  }

  .header h1 {
    font-size: 3rem;
  }
}

@media (max-width: 768px) {
  .demos-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .home-container {
    padding: 1.5rem 2rem;
  }

  .header h1 {
    font-size: 2.5rem;
  }

  .chapter-section {
    padding: 2rem;
  }

  .demo-preview {
    height: 200px;
  }
}
</style>
