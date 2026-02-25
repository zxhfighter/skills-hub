# Markdown 格式完整示例

这是一个展示所有支持的 Markdown 格式的文档，包含 **粗体**、_斜体_、`行内代码` 和 ~~删除线~~ 等样式。

:::callout color=blue emoji=star
📘 **提示**：本文档展示了 feishu-doc-writer 技能支持的所有格式，包括表格、高亮块、代码块等。
:::

## 文本样式演示

这是一段普通文本。下面展示各种文本样式：

- **这是粗体文本** - 用于强调重要内容
- _这是斜体文本_ - 用于引用或术语
- `console.log()` - 这是行内代码
- ~~这是删除线文本~~ - 表示已废弃的内容

混合使用：**粗体中的 _斜体_ 文本** 和 _斜体中的 `代码`_

## 列表示例

### 无序列表

- 第一个要点
- 第二个要点
- 第三个要点
- 最后一个要点

### 有序列表

1. 第一步：准备工作
2. 第二步：开始实施
3. 第三步：检查结果
4. 第四步：完成部署

## 待办事项

- [ ] 需要完成的任务 1
- [ ] 需要完成的任务 2
- [x] 已完成的任务 3
- [x] 已完成的任务 4
- [ ] 待处理的任务 5

---

## 表格示例

下面是一个功能对比表格：

| 功能   | 支持状态 | 说明                     |
| ------ | -------- | ------------------------ |
| 标题   | ✅ 支持  | H1-H4 四级标题           |
| 文本   | ✅ 支持  | 粗体、斜体、代码、删除线 |
| 列表   | ✅ 支持  | 无序列表、有序列表       |
| 代码块 | ✅ 支持  | 多语言语法高亮           |
| 表格   | ✅ 支持  | 标准 Markdown 表格       |
| 高亮块 | ✅ 支持  | 自定义颜色和图标         |

---

## 高亮块示例

:::callout color=green emoji=bulb
💡 **最佳实践**：在编写文档时，使用高亮块来突出重要信息，帮助读者快速抓住要点。
:::

:::callout color=yellow emoji=warning
⚠️ **注意**：请确保飞书应用已配置正确的权限，否则可能无法创建文档。
:::

:::callout color=red emoji=fire
🔥 **重要提醒**：API 调用有频率限制，建议在每次请求之间添加适当的延时。
:::

---

## 分栏示例

:::grid cols=2
**左侧内容**：这是分栏的第一列，可以放置任意文本内容。
---col---
**右侧内容**：这是分栏的第二列，与左侧并排显示。
:::

:::grid cols=3
📦 **功能一**：支持多种 Block 类型
---col---
🚀 **功能二**：保持写入顺序
---col---
✨ **功能三**：自动格式转换
:::

---

## 代码块示例

### JavaScript 代码

```javascript
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("数据获取成功:", data);
    return data;
  } catch (error) {
    console.error("请求失败:", error);
    throw error;
  }
}
```

### Python 代码

```python
def fibonacci(n):
    """生成斐波那契数列"""
    if n <= 0:
        return []
    elif n == 1:
        return [0]

    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence

print(fibonacci(10))
```

### Shell 命令

```bash
#!/bin/bash
echo "开始部署..."
npm install
npm run build
npm run deploy
echo "部署完成!"
```

### JSON 配置

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 引用示例

> 这是一段引用文字。引用通常用于展示名言、警句或重要的参考信息。

> 代码是写给人看的，顺便让机器执行。—— Harold Abelson

---

## 多级标题展示

### 三级标题

这是三级标题下的内容。

#### 四级标题

这是四级标题下的内容，用于更细致的分类。

---

## 总结

本文档展示了以下 Markdown 格式：

| 格式类型  | 描述                      |
| --------- | ------------------------- |
| 标题      | 一级到四级标题            |
| 文本/列表 | 粗体、斜体、有序/无序列表 |
| 代码/引用 | 代码块、引用块            |
| 表格/高亮 | Markdown 表格、高亮块     |

:::callout color=purple emoji=sparkles
✨ **完成**：感谢阅读本文档！feishu-doc-writer 技能让你可以轻松将 Markdown 内容写入飞书云文档。
:::
