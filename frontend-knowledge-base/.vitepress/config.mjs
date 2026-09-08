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
        { text: '首页', link: '/' },
        { text: '总目录', link: '/00-知识地图与总目录' },
        { text: 'GitHub', link: 'https://github.com/inspire-man/frontend-knowledge-base' },
      ],
      sidebar: [
        {
          text: '开始',
          items: [{ text: '知识地图与总目录', link: '/00-知识地图与总目录' }],
        },
        ...buildSidebar(),
        {
          text: '附录 A · 手写系列',
          collapsed: true,
          items: [
            { text: '手写 Promise', link: '/附录A-手写系列/A1-手写Promise' },
            { text: 'call·apply·bind·new·instanceof', link: '/附录A-手写系列/A2-手写call-apply-bind-new-instanceof' },
            { text: '防抖·节流·柯里化', link: '/附录A-手写系列/A3-手写防抖节流与柯里化' },
            { text: '深拷贝·pLimit', link: '/附录A-手写系列/A4-手写深拷贝与并发控制' },
            { text: '发布订阅·数组方法', link: '/附录A-手写系列/A5-手写发布订阅与数组方法' },
          ],
        },
        {
          text: '附录 B · 对比清单',
          collapsed: true,
          items: [
            { text: 'Vue vs React', link: '/附录B-对比清单/B1-Vue与React对比' },
            { text: '构建工具对比', link: '/附录B-对比清单/B2-构建工具对比' },
            { text: '网络请求对比', link: '/附录B-对比清单/B3-网络请求对比' },
            { text: '包管理与渲染模式对比', link: '/附录B-对比清单/B4-包管理与渲染模式对比' },
          ],
        },
        {
          text: '附录 C · 术语表',
          collapsed: true,
          items: [{ text: '术语速查', link: '/附录C-术语表/README' }],
        },
      ],
      search: { provider: 'local' },
      outline: { level: [2, 3], label: '本页目录' },
      docFooter: { prev: '上一篇', next: '下一篇' },
      lastUpdated: { text: '最后更新' },
      darkModeSwitchLabel: '暗色',
      lightModeSwitchLabel: '亮色',
      sidebarMenuLabel: '目录',
      returnToTopLabel: '返回顶部',
    },
    markdown: { lineNumbers: true },
    ignoreDeadLinks: true,
  })
)
