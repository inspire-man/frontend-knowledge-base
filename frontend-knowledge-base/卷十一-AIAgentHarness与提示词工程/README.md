# 卷十一 · AI Agent Harness 与提示词工程(着重)

> 本卷目标:不打散点,而是**彻底打通底层逻辑**——从 LLM 的本质,到 Agent 如何"思考→行动→观察"地循环,再到 Harness(运行时)、上下文、工具、提示词,最后收敛成一个统一框架。

## 目录与进度

- [x] 11.1 从 LLM 到 Agent:底层心智 ✅
- [x] 11.2 Agent 核心循环(ReAct / 规划-执行-观察) ✅
- [x] 11.3 Harness 工程(运行时 / 状态机 / 错误恢复) ✅
- [ ] 11.4 上下文工程(窗口 / 记忆 / 压缩 / RAG)
- [ ] 11.5 工具调用(Function Calling / schema / 安全)
- [ ] 11.6 提示词工程(上):指令与结构
- [ ] 11.7 提示词工程(下):推理增强
- [ ] 11.8 底层逻辑打通:统一框架

## 参考来源

- 官方:Anthropic(Claude)、OpenAI 文档;《Building Effective Agents》等业界文章;LangChain/OpenAgents 等实现

---

## 进度追踪

- 总体进度:**3 / 8**
- 下一篇:11.4 上下文工程