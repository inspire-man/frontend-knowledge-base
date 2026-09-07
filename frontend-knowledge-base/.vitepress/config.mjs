import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 卷目录(按顺序)
const volumes = [
  { dir: '卷一-JavaScript语言内核', title: '卷一 · JavaScript 语言内核' },
  { dir: '卷二-浏览器工作原理', title: '卷二 · 浏览器工作原理' },
  { dir: '卷三-HTML与CSS', title: '卷三 · HTML 与 CSS' },
  { dir: '卷四-网络与通信', title: '卷四 · 网络与通信' },
  { dir: '卷五-构建与工程化', title: '卷五 · 构建与工程化' },
  { dir: '卷六-框架核心Vue3', title: '卷六 · 框架核心 Vue3' },
  { dir: '卷七-框架核心React', title: '卷七 · 框架核心 React' },
  { dir: '卷八-TypeScript', title: '卷八 · TypeScript' },
  { dir: '卷九-Node.js与运行时', title: '卷九 · Node.js 与运行时' },
  { dir: '卷十-性能优化与工程质量', title: '卷十 · 性能优化与工程质量' },
  { dir: '卷十一-AIAgentHarness与提示词工程', title: '卷十一 · AI Agent Harness 与提示词工程' },
]

// "1.1-语言基础与类型系统.md" -> "1.1 语言基础与类型系统"
function cleanTitle(filename) {
  return filename.replace(/\.md$/, '').replace(/^(\d+(?:\.\d+)?)-/, '$1 ')
}

function buildSidebar() {
  return volumes.map((v) => {
    const dirPath = path.join(__dirname, '..', v.dir)
    let items = []
    try {
      items = fs
        .readdirSync(dirPath)
        .filter((f) => f.endsWith('.md') && f !== 'README.md')
        .sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }))
        .map((f) => ({ text: cleanTitle(f), link: `/${v.dir}/${f.replace(/\.md$/, '')}` }))
    } catch (e) {
      /* 目录不存在则跳过 */
    }
    return { text: v.title, collapsed: true, items }
  })
}

export default withMermaid(
  defineConfig({
    base: '/frontend-knowledge-base/',
    title: '前端知识库',
    description: '体系化个人前端知识库',
    lang: 'zh-CN',
    themeConfig: {
      nav: [
        { text: '总目录', link: '/00-知识地图与总目录' },
        { text: 'GitHub', link: 'https://github.com/inspire-man/frontend-knowledge-base' },
      ],
      sidebar: [
        {
          text: '开始',
          items: [{ text: '知识地图与总目录', link: '/00-知识地图与总目录' }],
        },
        ...buildSidebar(),
      ],
      search: { provider: 'local' },
      outline: { level: [2, 3], label: '本页目录' },
      docFooter: { prev: '上一篇', next: '下一篇' },
      lastUpdated: { text: '最后更新' },
    },
    markdown: { lineNumbers: true },
    ignoreDeadLinks: true,
  })
)
