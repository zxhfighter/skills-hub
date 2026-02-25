# 安装指南

## 前置要求

1. Node.js 18 或更高版本
2. npm（随 Node.js 一起安装）
3. OpenClaw 环境

## 安装步骤

### 1. 安装 Mermaid CLI

```bash
# 全局安装 mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# 验证安装
mmdc --version
```

如果看到版本号输出，说明安装成功。

### 2. 在 OpenClaw 中使用

确保技能文件位于正确的位置：
```
/workspace/projects/workspace/skills/mermaid-diagram-generator/
```

### 3. 测试技能

```bash
# 进入技能目录
cd /workspace/projects/workspace/skills/mermaid-diagram-generator

# 运行测试示例
node scripts/test_examples.js
```

这将在 `examples/` 目录下生成所有类型的示例图表。

## 使用方法

### 直接在 OpenClaw 中使用

在 OpenClaw 对话中，你可以这样说：

- "生成一个流程图，显示登录流程"
- "创建一个序列图，展示 API 交互"
- "帮我做一个甘特图，展示项目时间线"
- "生成一个类图，展示用户系统的结构"

OpenClaw 会自动调用这个技能生成相应的图表。

### 命令行使用

```bash
# 基本用法
node scripts/generate_diagram.js \
  --type flowchart \
  --code "graph TD; A[Start] --> B[End]" \
  -o diagram.png

# 带标题
node scripts/generate_diagram.js \
  --type flowchart \
  --title "我的流程图" \
  --code "graph TD; A[Start] --> B[End]" \
  -o diagram.png

# 使用主题
node scripts/generate_diagram.js \
  --type flowchart \
  --theme dark \
  --code "graph TD; A[Start] --> B[End]" \
  -o diagram.png
```

## 支持的图表类型

- `flowchart` - 流程图
- `sequence` - 序列图
- `gantt` - 甘特图
- `classDiagram` - 类图
- `stateDiagram` - 状态图
- `erDiagram` - ER 图
- `pie` - 饼图
- `mindmap` - 思维导图

## 支持的主题

- `default` - 默认主题
- `forest` - 森林主题
- `dark` - 深色主题
- `neutral` - 中性主题

## 故障排除

### 问题：`mmdc: command not found`

**解决方案**：
```bash
npm install -g @mermaid-js/mermaid-cli
```

### 问题：生成的图片质量不高

**解决方案**：调整缩放比例
```bash
node scripts/generate_diagram.js \
  --type flowchart \
  --code "graph TD; A[Start] --> B[End]" \
  --scale 3 \
  -o diagram.png
```

### 问题：图片背景不是透明的

**解决方案**：
```bash
node scripts/generate_diagram.js \
  --type flowchart \
  --code "graph TD; A[Start] --> B[End]" \
  --background transparent \
  -o diagram.png
```

## 下一步

1. 阅读 `SKILL.md` 了解技能的详细说明
2. 查看 `EXAMPLES.md` 了解各种图表的使用示例
3. 在 OpenClaw 中开始使用这个技能！

## 获取帮助

如果遇到问题：
1. 检查 Node.js 和 npm 是否正确安装
2. 确认 mermaid CLI 是否正确安装
3. 查看 Mermaid 官方文档：https://mermaid.js.org/
