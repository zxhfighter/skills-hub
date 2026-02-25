# Mermaid Diagram Generator

一个用于在 OpenClaw 中生成各种 Mermaid 图表的技能。

## 功能特性

支持以下图表类型：
- ✅ 流程图 (Flowchart)
- ✅ 序列图 (Sequence Diagram)
- ✅ 甘特图 (Gantt Chart)
- ✅ 类图 (Class Diagram)
- ✅ 状态图 (State Diagram)
- ✅ ER 图 (ER Diagram)
- ✅ 饼图 (Pie Chart)
- ✅ 思维导图 (Mindmap)

## 安装依赖

```bash
# 全局安装 mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# 验证安装
mmdc --version
```

## 使用方法

### 基本用法

```bash
node scripts/generate_diagram.js \
  --type flowchart \
  --code "graph TD; A[Start] --> B[End]" \
  -o diagram.png
```

### 生成序列图

```bash
node scripts/generate_diagram.js \
  --type sequence \
  --title "API 交互" \
  --code "sequenceDiagram; Client->>Server: Request; Server-->>Client: Response" \
  -o sequence.png
```

### 生成甘特图

```bash
node scripts/generate_diagram.js \
  --type gantt \
  --title "项目计划" \
  --code "gantt; dateFormat YYYY-MM-DD; section Task; Task1 :2024-01-01, 10d" \
  -o gantt.png
```

## 参数说明

| 参数 | 说明 | 必需 |
|------|------|------|
| `--type` | 图表类型（flowchart, sequence, gantt 等） | ✅ |
| `--code` | Mermaid 代码 | ✅ |
| `--output` 或 `-o` | 输出文件路径 | ✅ |
| `--title` | 图表标题 | ❌ |
| `--theme` | 主题（default, forest, dark, neutral） | ❌ |
| `--scale` | 缩放比例（默认 2） | ❌ |
| `--background` | 背景颜色（transparent 或颜色值） | ❌ |

## 快速测试

```bash
# 生成所有示例图表
npm test
```

生成的示例文件保存在 `examples/` 目录下。

## 在 OpenClaw 中使用

在 OpenClaw 中，你可以直接说：

- "生成一个流程图，显示从登录到购买商品的流程"
- "创建一个序列图，展示客户端和服务器之间的交互"
- "帮我做一个甘特图，展示项目的时间线"

OpenClaw 会自动调用此技能生成相应的图表。

## 图表示例

### 流程图

```
graph TD
    A[开始] --> B{判断}
    B -->|是| C[方案 A]
    B -->|否| D[方案 B]
    C --> E[结束]
    D --> E
```

### 序列图

```
sequenceDiagram
    participant 用户
    participant 系统
    用户->>系统: 登录请求
    系统-->>用户: 登录成功
```

### 甘特图

```
gantt
    title 项目进度
    dateFormat YYYY-MM-DD
    section 开发
    设计: des1, 2024-01-01, 10d
    开发: des2, after des1, 20d
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
