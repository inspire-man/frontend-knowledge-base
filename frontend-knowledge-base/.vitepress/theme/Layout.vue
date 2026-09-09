<script setup>
import DefaultTheme from 'vitepress/theme'
import { useRoute } from 'vitepress'
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue'

const { Layout } = DefaultTheme
const route = useRoute()

// 阅读进度条
const progress = ref(0)
const onScroll = () => {
  const doc = document.documentElement
  const total = doc.scrollHeight - doc.clientHeight
  progress.value = total > 0 ? (doc.scrollTop / total) * 100 : 0
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

// 代码块复制按钮(初始 + 路由切换时重挂)
const addCopyButtons = () => {
  nextTick(() => {
    document.querySelectorAll('div[class*="language-"]').forEach((block) => {
      if (block.querySelector('.copy-btn')) return
      const btn = document.createElement('button')
      btn.className = 'copy-btn'
      btn.textContent = '复制'
      btn.addEventListener('click', async () => {
        const code = block.querySelector('pre code')?.innerText || ''
        try {
          await navigator.clipboard.writeText(code)
          btn.textContent = '已复制'
          setTimeout(() => (btn.textContent = '复制'), 2000)
        } catch (e) {
          btn.textContent = '复制失败'
        }
      })
      block.appendChild(btn)
    })
  })
}

// 阅读时长估算(中文约 400 字/分钟)
const readingTime = ref('')
const calcReadingTime = () => {
  setTimeout(() => {
    const el = document.querySelector('.vp-doc')
    if (!el) { readingTime.value = ''; return }
    const chars = (el.innerText || '').replace(/\s/g, '').length
    const minutes = Math.max(1, Math.round(chars / 400))
    readingTime.value = `约 ${minutes} 分钟`
  }, 100)
}

onMounted(() => {
  addCopyButtons()
  calcReadingTime()
})
watch(() => route.path, () => {
  addCopyButtons()
  calcReadingTime()
})
</script>

<template>
  <Layout>
    <template #layout-top>
      <div class="reading-progress" :style="{ width: progress + '%' }"></div>
    </template>
    <template #doc-before>
      <div v-if="readingTime" class="reading-time">
        <span class="rt-dot"></span>{{ readingTime }}
      </div>
    </template>
  </Layout>
</template>
