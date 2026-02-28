---
name: json-canvas
description: 创建和编辑 JSON Canvas 文件（.canvas），支持节点（文本、文件、链接、分组）、连线、颜色和布局。适用于思维导图、看板、流程图、研究画布等场景，在 Obsidian 中完美渲染。
---

# JSON Canvas Skill

基于 [JSON Canvas Spec 1.0](https://jsoncanvas.org/spec/1.0/) 创建和编辑 `.canvas` 文件。

## 文件结构

Canvas 文件包含两个顶层数组：

```json
{
  "nodes": [],
  "edges": []
}
```

- `nodes`（可选）：画布上的节点数组，按 z-index 升序排列（首元素在最底层）
- `edges`（可选）：连接节点的边数组

## 节点（Nodes）

所有节点共享以下通用属性：

| 属性     | 必填 | 类型        | 说明                               |
| -------- | :--: | ----------- | ---------------------------------- |
| `id`     |  ✅  | string      | 唯一标识符（16 位小写十六进制）    |
| `type`   |  ✅  | string      | `text` / `file` / `link` / `group` |
| `x`      |  ✅  | integer     | X 坐标（像素，向右为正）           |
| `y`      |  ✅  | integer     | Y 坐标（像素，向下为正）           |
| `width`  |  ✅  | integer     | 宽度（像素）                       |
| `height` |  ✅  | integer     | 高度（像素）                       |
| `color`  |  ❌  | canvasColor | 颜色（见颜色章节）                 |

### 文本节点（text）

存储 Markdown 文本内容。

| 属性   | 必填 | 类型   | 说明                |
| ------ | :--: | ------ | ------------------- |
| `text` |  ✅  | string | Markdown 格式纯文本 |

```json
{
  "id": "6f0ad84f44ce9c17",
  "type": "text",
  "x": 0,
  "y": 0,
  "width": 400,
  "height": 200,
  "text": "# Hello World\n\nThis is **Markdown** content."
}
```

### 文件节点（file）

引用文件或附件（图片、视频、PDF、笔记等）。

| 属性      | 必填 | 类型   | 说明                              |
| --------- | :--: | ------ | --------------------------------- |
| `file`    |  ✅  | string | 系统内文件路径                    |
| `subpath` |  ❌  | string | 子路径标题或块引用（以 `#` 开头） |

```json
{
  "id": "a1b2c3d4e5f67890",
  "type": "file",
  "x": 500,
  "y": 0,
  "width": 400,
  "height": 300,
  "file": "Attachments/diagram.png"
}
```

### 链接节点（link）

展示外部 URL。

| 属性  | 必填 | 类型   | 说明     |
| ----- | :--: | ------ | -------- |
| `url` |  ✅  | string | 外部 URL |

```json
{
  "id": "c3d4e5f678901234",
  "type": "link",
  "x": 1000,
  "y": 0,
  "width": 400,
  "height": 200,
  "url": "https://obsidian.md"
}
```

### 分组节点（group）

可视化容器，用于组织其他节点。

| 属性              | 必填 | 类型   | 说明                         |
| ----------------- | :--: | ------ | ---------------------------- |
| `label`           |  ❌  | string | 分组标签                     |
| `background`      |  ❌  | string | 背景图片路径                 |
| `backgroundStyle` |  ❌  | string | `cover` / `ratio` / `repeat` |

```json
{
  "id": "d4e5f6789012345a",
  "type": "group",
  "x": -50,
  "y": -50,
  "width": 1000,
  "height": 600,
  "label": "Project Overview",
  "color": "4"
}
```

**backgroundStyle 取值：**

| 值       | 说明               |
| -------- | ------------------ |
| `cover`  | 填满整个节点       |
| `ratio`  | 保持图片原始宽高比 |
| `repeat` | 在 x/y 方向平铺    |

## 边（Edges）

连接节点的线段。

| 属性       | 必填 | 类型        | 默认值  | 说明                                        |
| ---------- | :--: | ----------- | ------- | ------------------------------------------- |
| `id`       |  ✅  | string      | —       | 唯一标识符                                  |
| `fromNode` |  ✅  | string      | —       | 起始节点 ID                                 |
| `fromSide` |  ❌  | string      | —       | 起始边：`top` / `right` / `bottom` / `left` |
| `fromEnd`  |  ❌  | string      | `none`  | 起点端形：`none` / `arrow`                  |
| `toNode`   |  ✅  | string      | —       | 目标节点 ID                                 |
| `toSide`   |  ❌  | string      | —       | 目标边：`top` / `right` / `bottom` / `left` |
| `toEnd`    |  ❌  | string      | `arrow` | 终点端形：`none` / `arrow`                  |
| `color`    |  ❌  | canvasColor | —       | 线条颜色                                    |
| `label`    |  ❌  | string      | —       | 文字标签                                    |

```json
{
  "id": "f67890123456789a",
  "fromNode": "6f0ad84f44ce9c17",
  "fromSide": "right",
  "toNode": "a1b2c3d4e5f67890",
  "toSide": "left",
  "toEnd": "arrow",
  "label": "leads to"
}
```

## 颜色（Color）

`canvasColor` 类型支持两种格式：

### HEX 颜色

```json
{ "color": "#FF0000" }
```

### 预设颜色

| 预设值 | 颜色    |
| ------ | ------- |
| `"1"`  | 🔴 红色 |
| `"2"`  | 🟠 橙色 |
| `"3"`  | 🟡 黄色 |
| `"4"`  | 🟢 绿色 |
| `"5"`  | 🔵 青色 |
| `"6"`  | 🟣 紫色 |

> 预设色的具体色值由应用自行定义，以适配品牌色。

## ID 生成规则

所有 `id` 必须唯一，建议使用 **16 位小写十六进制字符串**：

```
"id": "6f0ad84f44ce9c17"
```

生成方式：64-bit 随机值的十六进制编码。

## 布局指南

### 坐标系

- 坐标可为负数（画布无限延伸）
- `x` 向右递增，`y` 向下递增
- 坐标指向节点**左上角**

### 推荐尺寸

| 节点类型 | 建议宽度   | 建议高度   |
| -------- | ---------- | ---------- |
| 小文本   | 200–300    | 80–150     |
| 中文本   | 300–450    | 150–300    |
| 大文本   | 400–600    | 300–500    |
| 文件预览 | 300–500    | 200–400    |
| 链接预览 | 250–400    | 100–200    |
| 分组     | 按内容而定 | 按内容而定 |

### 间距

- 分组内边距：20–50px
- 节点间距：50–100px
- 对齐到 10px 或 20px 网格

## 校验规则

1. 所有 `id` 在节点和边中全局唯一
2. `fromNode` / `toNode` 必须引用已存在的节点 ID
3. 每种节点类型的必填字段必须齐全
4. `type` 只能是 `text` / `file` / `link` / `group`
5. `backgroundStyle` 只能是 `cover` / `ratio` / `repeat`
6. `fromSide` / `toSide` 只能是 `top` / `right` / `bottom` / `left`
7. `fromEnd` / `toEnd` 只能是 `none` / `arrow`
8. 颜色必须是 `"1"`–`"6"` 或有效的 HEX 颜色（如 `#FF0000`）

## 完整示例

### 思维导图

```json
{
  "nodes": [
    {
      "id": "8a9b0c1d2e3f4a5b",
      "type": "text",
      "x": 0,
      "y": 0,
      "width": 300,
      "height": 150,
      "text": "# Main Idea\n\nThis is the central concept."
    },
    {
      "id": "1a2b3c4d5e6f7a8b",
      "type": "text",
      "x": 400,
      "y": -100,
      "width": 250,
      "height": 100,
      "text": "## Supporting Point A\n\nDetails here."
    },
    {
      "id": "2b3c4d5e6f7a8b9c",
      "type": "text",
      "x": 400,
      "y": 100,
      "width": 250,
      "height": 100,
      "text": "## Supporting Point B\n\nMore details."
    }
  ],
  "edges": [
    {
      "id": "3c4d5e6f7a8b9c0d",
      "fromNode": "8a9b0c1d2e3f4a5b",
      "fromSide": "right",
      "toNode": "1a2b3c4d5e6f7a8b",
      "toSide": "left"
    },
    {
      "id": "4d5e6f7a8b9c0d1e",
      "fromNode": "8a9b0c1d2e3f4a5b",
      "fromSide": "right",
      "toNode": "2b3c4d5e6f7a8b9c",
      "toSide": "left"
    }
  ]
}
```

### 看板（Kanban）

```json
{
  "nodes": [
    {
      "id": "5e6f7a8b9c0d1e2f",
      "type": "group",
      "x": 0,
      "y": 0,
      "width": 300,
      "height": 500,
      "label": "To Do",
      "color": "1"
    },
    {
      "id": "6f7a8b9c0d1e2f3a",
      "type": "group",
      "x": 350,
      "y": 0,
      "width": 300,
      "height": 500,
      "label": "In Progress",
      "color": "3"
    },
    {
      "id": "7a8b9c0d1e2f3a4b",
      "type": "group",
      "x": 700,
      "y": 0,
      "width": 300,
      "height": 500,
      "label": "Done",
      "color": "4"
    },
    {
      "id": "8b9c0d1e2f3a4b5c",
      "type": "text",
      "x": 20,
      "y": 50,
      "width": 260,
      "height": 80,
      "text": "## Task 1\n\nImplement feature X"
    },
    {
      "id": "9c0d1e2f3a4b5c6d",
      "type": "text",
      "x": 370,
      "y": 50,
      "width": 260,
      "height": 80,
      "text": "## Task 2\n\nReview PR #123",
      "color": "2"
    },
    {
      "id": "0d1e2f3a4b5c6d7e",
      "type": "text",
      "x": 720,
      "y": 50,
      "width": 260,
      "height": 80,
      "text": "## Task 3\n\n~~Setup CI/CD~~"
    }
  ],
  "edges": []
}
```

### 流程图

```json
{
  "nodes": [
    {
      "id": "a0b1c2d3e4f5a6b7",
      "type": "text",
      "x": 200,
      "y": 0,
      "width": 150,
      "height": 60,
      "text": "**Start**",
      "color": "4"
    },
    {
      "id": "b1c2d3e4f5a6b7c8",
      "type": "text",
      "x": 200,
      "y": 100,
      "width": 150,
      "height": 60,
      "text": "Step 1:\nGather data"
    },
    {
      "id": "c2d3e4f5a6b7c8d9",
      "type": "text",
      "x": 200,
      "y": 200,
      "width": 150,
      "height": 80,
      "text": "**Decision**\n\nIs data valid?",
      "color": "3"
    },
    {
      "id": "d3e4f5a6b7c8d9e0",
      "type": "text",
      "x": 400,
      "y": 200,
      "width": 150,
      "height": 60,
      "text": "Process data"
    },
    {
      "id": "e4f5a6b7c8d9e0f1",
      "type": "text",
      "x": 0,
      "y": 200,
      "width": 150,
      "height": 60,
      "text": "Request new data",
      "color": "1"
    },
    {
      "id": "f5a6b7c8d9e0f1a2",
      "type": "text",
      "x": 400,
      "y": 320,
      "width": 150,
      "height": 60,
      "text": "**End**",
      "color": "4"
    }
  ],
  "edges": [
    {
      "id": "a6b7c8d9e0f1a2b3",
      "fromNode": "a0b1c2d3e4f5a6b7",
      "fromSide": "bottom",
      "toNode": "b1c2d3e4f5a6b7c8",
      "toSide": "top"
    },
    {
      "id": "b7c8d9e0f1a2b3c4",
      "fromNode": "b1c2d3e4f5a6b7c8",
      "fromSide": "bottom",
      "toNode": "c2d3e4f5a6b7c8d9",
      "toSide": "top"
    },
    {
      "id": "c8d9e0f1a2b3c4d5",
      "fromNode": "c2d3e4f5a6b7c8d9",
      "fromSide": "right",
      "toNode": "d3e4f5a6b7c8d9e0",
      "toSide": "left",
      "label": "Yes",
      "color": "4"
    },
    {
      "id": "d9e0f1a2b3c4d5e6",
      "fromNode": "c2d3e4f5a6b7c8d9",
      "fromSide": "left",
      "toNode": "e4f5a6b7c8d9e0f1",
      "toSide": "right",
      "label": "No",
      "color": "1"
    },
    {
      "id": "e0f1a2b3c4d5e6f7",
      "fromNode": "e4f5a6b7c8d9e0f1",
      "fromSide": "top",
      "fromEnd": "none",
      "toNode": "b1c2d3e4f5a6b7c8",
      "toSide": "left",
      "toEnd": "arrow"
    },
    {
      "id": "f1a2b3c4d5e6f7a8",
      "fromNode": "d3e4f5a6b7c8d9e0",
      "fromSide": "bottom",
      "toNode": "f5a6b7c8d9e0f1a2",
      "toSide": "top"
    }
  ]
}
```

### 研究画布（含文件和链接节点）

```json
{
  "nodes": [
    {
      "id": "1e2f3a4b5c6d7e8f",
      "type": "text",
      "x": 300,
      "y": 200,
      "width": 400,
      "height": 200,
      "text": "# Research Topic\n\n## Key Questions\n\n- How does X affect Y?\n- What are the implications?",
      "color": "5"
    },
    {
      "id": "2f3a4b5c6d7e8f9a",
      "type": "file",
      "x": 0,
      "y": 0,
      "width": 250,
      "height": 150,
      "file": "Literature/Paper A.pdf"
    },
    {
      "id": "3a4b5c6d7e8f9a0b",
      "type": "file",
      "x": 0,
      "y": 200,
      "width": 250,
      "height": 150,
      "file": "Notes/Meeting Notes.md",
      "subpath": "#Key Insights"
    },
    {
      "id": "4b5c6d7e8f9a0b1c",
      "type": "link",
      "x": 0,
      "y": 400,
      "width": 250,
      "height": 100,
      "url": "https://example.com/research"
    },
    {
      "id": "5c6d7e8f9a0b1c2d",
      "type": "file",
      "x": 750,
      "y": 150,
      "width": 300,
      "height": 250,
      "file": "Attachments/diagram.png"
    }
  ],
  "edges": [
    {
      "id": "6d7e8f9a0b1c2d3e",
      "fromNode": "2f3a4b5c6d7e8f9a",
      "fromSide": "right",
      "toNode": "1e2f3a4b5c6d7e8f",
      "toSide": "left",
      "label": "supports"
    },
    {
      "id": "7e8f9a0b1c2d3e4f",
      "fromNode": "3a4b5c6d7e8f9a0b",
      "fromSide": "right",
      "toNode": "1e2f3a4b5c6d7e8f",
      "toSide": "left",
      "label": "informs"
    },
    {
      "id": "8f9a0b1c2d3e4f5a",
      "fromNode": "4b5c6d7e8f9a0b1c",
      "fromSide": "right",
      "toNode": "1e2f3a4b5c6d7e8f",
      "toSide": "left",
      "toEnd": "arrow",
      "color": "6"
    },
    {
      "id": "9a0b1c2d3e4f5a6b",
      "fromNode": "1e2f3a4b5c6d7e8f",
      "fromSide": "right",
      "toNode": "5c6d7e8f9a0b1c2d",
      "toSide": "left",
      "label": "visualized by"
    }
  ]
}
```

## 工具脚本

### 校验 Canvas 文件

```bash
node scripts/validate.js <file.canvas>
```

### 生成 Canvas 模板

```bash
# 思维导图
node scripts/generate.js --template mindmap --title "My Topic" --items "Idea A,Idea B,Idea C" -o output.canvas

# 看板
node scripts/generate.js --template kanban --title "Sprint 1" --items "Task A,Task B,Task C" -o board.canvas

# 流程图
node scripts/generate.js --template flowchart --title "Process" --items "Start,Step 1,Decision,End" -o flow.canvas
```

## 参考链接

- [JSON Canvas Spec 1.0](https://jsoncanvas.org/spec/1.0/)
- [JSON Canvas GitHub](https://github.com/obsidianmd/jsoncanvas)
