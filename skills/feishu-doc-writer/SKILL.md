---
name: "feishu-doc-writer"
description: "写入飞书文档内容，支持标题、文本、列表、代码块、表格、图片等Block。当用户需要创建或更新飞书文档内容时调用。"
---

# 飞书文档写入 Skill

本 Skill 用于自动写入飞书文档内容，支持 Markdown 格式自动转换。

## 基础概念

### 文档结构

飞书文档由多个 **块（Block）** 组成，每个块都有唯一的 `block_id`。文档结构如下：

- **文档（Document）**：通过 `document_id` 标识，是一篇在线文档
- **块（Block）**：文档的最小构建单元，如文本、图片、表格等
- **页面块（Page Block）**：文档的根块，其 `block_id` 与 `document_id` 相同

### 获取 document_id

从文档 URL 获取：

```
https://xxx.feishu.cn/docx/{document_id}
```

## API 端点

### 1. 创建文档

```http
POST https://open.feishu.cn/open-apis/docx/v1/documents
```

**请求体：**

```json
{
  "folder_token": "string", // 可选，文档所在文件夹 token
  "title": "string" // 可选，文档标题
}
```

**响应示例：**

```json
{
  "code": 0,
  "data": {
    "document": {
      "document_id": "TLLKdcpDro9ijQxA33ycNMabcef",
      "revision_id": 1,
      "title": "工作周报"
    }
  }
}
```

### 2. 创建块（在指定位置添加子块）

```http
POST https://open.feishu.cn/open-apis/docx/v1/documents/{document_id}/blocks/{block_id}/children
```

**查询参数：**

- `document_revision_id`: 文档版本，-1 表示最新版本

**请求体：**

```json
{
  "index": 0,           // 插入位置索引（0 表示第一个）
  "children": [...]     // Block 数组
}
```

### 3. 创建嵌套块（一次性创建多层级块）

```http
POST https://open.feishu.cn/open-apis/docx/v1/documents/{document_id}/blocks/{block_id}/descendant
```

**查询参数：**

- `document_revision_id`: 文档版本，-1 表示最新版本

**请求体：**

```json
{
  "index": 0,
  "children_id": ["block_id_1", "block_id_2"],  // 顶层子块 ID
  "descendants": [...]  // 所有块的详细定义
}
```

## 🚀 快速使用

### 方式一：直接写入 Markdown 文件

```bash
# 设置环境变量后运行
FEISHU_APP_ID=xxx FEISHU_APP_SECRET=xxx node ./scripts/write-to-feishu.js <markdown_file> --title "文档标题"

# 示例
FEISHU_APP_ID=cli_xxx FEISHU_APP_SECRET=xxx node ./scripts/write-to-feishu.js README.md --title "项目介绍"
```

### 方式二：写入到已有文档

```bash
FEISHU_APP_ID=xxx FEISHU_APP_SECRET=xxx node ./scripts/write-to-feishu.js content.md --doc-id <document_id>
```

## 执行流程

当用户需要写入飞书文档时，按以下步骤执行：

### 1. 检查凭证

检查用户是否提供了飞书应用凭证：

- `FEISHU_APP_ID`: 飞书应用 ID
- `FEISHU_APP_SECRET`: 飞书应用密钥

**如果用户没有提供，必须询问用户获取凭证。**

### 2. 准备内容

将用户提供的内容保存为临时 Markdown 文件，或直接使用用户指定的文件。

### 3. 执行写入命令

使用 RunCommand 工具执行：

```bash
FEISHU_APP_ID=<用户提供的ID> FEISHU_APP_SECRET=<用户提供的密钥> node ./write-to-feishu.js <文件路径> --title "<标题>"
```

### 4. 返回结果

将生成的文档链接返回给用户。

## 支持的 Markdown 语法

脚本会自动将 Markdown 转换为飞书 Block：

| Markdown 语法            | 飞书 Block                 |
| ------------------------ | -------------------------- |
| `# 标题`                 | 一级标题                   |
| `## 标题`                | 二级标题                   |
| `### 标题`               | 三级标题                   |
| `- 列表`                 | 无序列表                   |
| `1. 列表`                | 有序列表                   |
| ` ```code``` `           | 代码块（支持语言高亮）     |
| `> 引用`                 | 引用块                     |
| `---`                    | 分割线                     |
| `**粗体**`               | 粗体文本                   |
| `*斜体*`                 | 斜体文本                   |
| `` `代码` ``             | 行内代码                   |
| `~~删除线~~`             | 删除线文本                 |
| `- [ ] 待办`             | 待办事项                   |
| `- [x] 已完成`           | 已完成待办                 |
| `\| 表格 \|`             | 表格（标准 Markdown 表格） |
| `:::callout ... :::`     | 高亮块（自定义语法）       |
| `:::grid cols=N ... :::` | 分栏（自定义语法）         |

## 扩展语法

### 高亮块 (Callout)

```markdown
:::callout color=green emoji=bulb
这是高亮块的内容，支持 **粗体** 和 _斜体_。
:::
```

**颜色选项：** red, orange, yellow, green, blue, purple, gray

### 分栏 (Grid)

```markdown
:::grid cols=2
第一列内容
---col---
第二列内容
:::
```

**列数限制：** 2-4 列，使用 `---col---` 或 `:::col` 分隔各列。

### 表格 (Table)

使用标准 Markdown 表格语法：

```markdown
| 列1 | 列2 | 列3 |
| --- | --- | --- |
| A1  | B1  | C1  |
| A2  | B2  | C2  |
```

## Block 基础结构

```json
{
  "block_id": "string",
  "block_type": 2,
  "parent_id": "string",
  "children": ["child_block_id_1"],
  "text": { ... }  // 根据 block_type 对应的数据实体
}
```

## Block 类型速查表

| block_type      | 值  | 说明       |
| --------------- | --- | ---------- |
| page            | 1   | 页面块     |
| text            | 2   | 文本块     |
| heading1        | 3   | 一级标题   |
| heading2        | 4   | 二级标题   |
| heading3        | 5   | 三级标题   |
| heading4        | 6   | 四级标题   |
| heading5        | 7   | 五级标题   |
| heading6        | 8   | 六级标题   |
| heading7        | 9   | 七级标题   |
| heading8        | 10  | 八级标题   |
| heading9        | 11  | 九级标题   |
| bullet          | 12  | 无序列表   |
| ordered         | 13  | 有序列表   |
| code            | 14  | 代码块     |
| quote           | 15  | 引用块     |
| todo            | 17  | 待办事项   |
| divider         | 22  | 分割线     |
| image           | 27  | 图片块     |
| sheet           | 30  | 电子表格   |
| table           | 31  | 表格块     |
| table_cell      | 32  | 表格单元格 |
| grid            | 34  | 分栏块     |
| grid_column     | 35  | 分栏列     |
| callout         | 19  | 高亮块     |
| quote_container | 44  | 引用容器   |

## Block 结构模板

### 文本块

```json
{
  "block_type": 2,
  "text": {
    "elements": [{ "text_run": { "content": "文本内容" } }],
    "style": {
      "align": 1 // 1: 左对齐, 2: 居中, 3: 右对齐
    }
  }
}
```

### 带样式的文本

```json
{
  "block_type": 2,
  "text": {
    "elements": [
      {
        "text_run": {
          "content": "粗体",
          "text_element_style": { "bold": true }
        }
      },
      {
        "text_run": {
          "content": "斜体",
          "text_element_style": { "italic": true }
        }
      },
      {
        "text_run": {
          "content": "下划线",
          "text_element_style": { "underline": true }
        }
      }
    ]
  }
}
```

更多文本样式：

```json
{
  "text_run": {
    "content": "带样式的文本",
    "text_element_style": {
      "bold": true, // 粗体
      "italic": true, // 斜体
      "underline": true, // 下划线
      "strikethrough": false, // 删除线
      "inline_code": false, // 行内代码
      "text_color": 1, // 文字颜色
      "background_color": 3, // 背景颜色
      "link": {
        // 链接
        "url": "https://example.com"
      }
    }
  }
}
```

### 标题块

```json
{
  "block_type": 3,
  "heading1": {
    "elements": [{ "text_run": { "content": "标题内容" } }],
    "style": {
      "folded": false
    }
  }
}
```

> **注意**：
>
> - `block_type` 分别为 3-11，分别对应 heading1-heading9。
> - `heading1` 的键名需要跟随 `block_type` 相应变化：`heading1`, `heading2`, ... `heading9`。

### 无序列表

```json
{
  "block_type": 12,
  "bullet": {
    "elements": [{ "text_run": { "content": "列表项" } }]
  }
}
```

### 有序列表

```json
{
  "block_type": 13,
  "ordered": {
    "elements": [{ "text_run": { "content": "列表项" } }]
  }
}
```

### 代码块

```json
{
  "block_type": 14,
  "code": {
    "elements": [{ "text_run": { "content": "代码内容" } }],
    "style": { "language": 22, "wrap": true }
  }
}
```

**常用语言枚举值：**

| language   | 值  |
| ---------- | --- |
| PlainText  | 1   |
| Python     | 18  |
| JavaScript | 22  |
| TypeScript | 30  |
| Java       | 13  |
| Go         | 10  |
| Rust       | 20  |
| C          | 2   |
| C++        | 3   |
| Shell      | 23  |
| JSON       | 15  |
| YAML       | 35  |
| SQL        | 25  |
| HTML       | 11  |
| CSS        | 5   |
| Markdown   | 17  |

### 引用块

```json
{
  "block_type": 15,
  "quote": {
    "elements": [{ "text_run": { "content": "引用内容" } }]
  }
}
```

### 分割线

```json
{
  "block_type": 22,
  "divider": {}
}
```

### 高亮块（需要分步创建）

高亮块本身不能包含文本内容，其文本内存在于其子块中。使用嵌套块创建时：

```json
{
  "block_id": "callout_id",
  "block_type": 19,
  "callout": {
    "background_color": 4,
    "border_color": 4,
    "emoji_id": "bulb"
  },
  "children": ["callout_text_id"]
}
```

**颜色：** red=1, orange=2, yellow=3, green=4, blue=5, purple=6, gray=7

### 待办事项

```json
{
  "block_type": 17,
  "todo": {
    "elements": [{ "text_run": { "content": "待办内容" } }],
    "style": { "done": false }
  }
}
```

### 表格（需要分步创建）

表格需要通过嵌套块 API 创建，包含 table、table_cell 和内容块。为了保证顺序控制和一次创建多层级块，推荐使用 descendant API：

```json
{
  "index": 0,
  "children_id": ["table_id_1"],
  "descendants": [
    {
      "block_id": "table_id_1",
      "block_type": 31,
      "table": {
        "property": { "row_size": 2, "column_size": 3 }
      },
      "children": ["cell_1", "cell_2", "cell_3", "cell_4", "cell_5", "cell_6"]
    },
    {
      "block_id": "cell_1",
      "block_type": 32,
      "table_cell": {},
      "children": ["cell_1_text"]
    },
    {
      "block_id": "cell_1_text",
      "block_type": 2,
      "text": {
        "elements": [{ "text_run": { "content": "表头1" } }]
      },
      "children": []
    }
    // ... 其他单元格
  ]
}
```

创建后获取 cell_ids，再向每个单元格写入内容，或直接利用 descendants API 在创建时写入文本内容。

### 分栏（需要分步创建）

分栏同样需要嵌套块 API，使用 descendant 一次性创建子列及列内容：

```json
{
  "index": 0,
  "children_id": ["grid_id_1"],
  "descendants": [
    {
      "block_id": "grid_id_1",
      "block_type": 34,
      "grid": { "column_size": 2 },
      "children": ["column_1", "column_2"]
    },
    {
      "block_id": "column_1",
      "block_type": 35,
      "grid_column": { "width_ratio": 50 },
      "children": ["column_1_content"]
    },
    {
      "block_id": "column_1_content",
      "block_type": 2,
      "text": {
        "elements": [{ "text_run": { "content": "左栏内容" } }]
      },
      "children": []
    }
    // ... 第二栏
  ]
}
```

**列数限制：** 2-4 列。创建后获取 grid_column_ids，再向每列写入内容，或直接使用 descendants API 一次性构建整棵树。

### 图片块 (Image)

图片需要两步操作：

**第一步：上传图片到文档**

```http
POST https://open.feishu.cn/open-apis/docx/v1/documents/{document_id}/blocks/{block_id}/media
Content-Type: multipart/form-data

file: (binary)
type: "image"
```

**第二步：创建图片块**

```json
{
  "block_type": 27,
  "image": {
    "token": "上传返回的 file_token",
    "width": 800,
    "height": 600
  }
}
```

## 保证写入顺序

### 方法一：顺序调用 API

按顺序逐个调用创建块 API，每次调用使用 `index` 参数指定位置：

```javascript
async function writeBlocksInOrder(documentId, parentBlockId, blocks) {
  for (let i = 0; i < blocks.length; i++) {
    await createBlock(documentId, parentBlockId, {
      index: i,
      children: [blocks[i]],
    });
  }
}
```

### 方法二：使用嵌套块 API（推荐）

使用 `descendant` API 一次性创建多个块，通过 `children_id` 数组控制顺序：

```json
{
  "index": 0,
  "children_id": ["block_1", "block_2", "block_3"],  // 按顺序排列
  "descendants": [
    { "block_id": "block_1", ... },
    { "block_id": "block_2", ... },
    { "block_id": "block_3", ... }
  ]
}
```

### 方法三：批量创建块

单次创建多个同级块时，`children` 数组的顺序即为显示顺序：

```json
{
  "index": 0,
  "children": [
    { "block_type": 3, "heading1": {...} },
    { "block_type": 2, "text": {...} },
    { "block_type": 12, "bullet": {...} }
  ]
}
```

## Markdown 到 Block 转换规则

当用户提供 Markdown 内容时，按以下规则转换：

| Markdown                 | Block 类型                       |
| ------------------------ | -------------------------------- |
| `# 标题`                 | heading1 (3)                     |
| `## 标题`                | heading2 (4)                     |
| `### 标题`               | heading3 (5)                     |
| `#### 标题`              | heading4 (6)                     |
| `- 列表` 或 `* 列表`     | bullet (12)                      |
| `1. 列表`                | ordered (13)                     |
| ` ```代码``` `           | code (14)                        |
| `> 引用`                 | quote (15)                       |
| `---`或`***`             | divider (22)                     |
| `**粗体**`               | text_element_style.bold          |
| `*斜体*`                 | text_element_style.italic        |
| `` `代码` ``             | text_element_style.inline_code   |
| `~~删除~~`               | text_element_style.strikethrough |
| `- [ ] 待办`             | todo (17, done=false)            |
| `- [x] 已完成`           | todo (17, done=true)             |
| `\| A \| B \|`           | table (31) + table_cell (32)     |
| `:::callout color=green` | callout (19) + text (2)          |
| `:::grid cols=2`         | grid (24) + grid_column (25)     |

## 执行示例

当用户说"帮我创建一个飞书文档，包含项目介绍"时：

1. 询问飞书凭证（如果没有）
2. 生成写入脚本或直接执行 API 调用
3. 创建文档并写入内容
4. 返回文档链接给用户

## 通过 API 创建完整文档的示例

```javascript
const BASE_URL = "https://open.feishu.cn/open-apis";
const ACCESS_TOKEN = "your_access_token";

async function createDocWithBlocks() {
  // 1. 创建文档
  const docResponse = await fetch(`${BASE_URL}/docx/v1/documents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: "示例文档" }),
  });
  const docData = await docResponse.json();
  const documentId = docData.data.document.document_id;

  // 2. 使用嵌套块 API 添加内容
  const blocks = {
    index: 0,
    children_id: ["heading", "text", "bullet1", "code", "callout"],
    descendants: [
      {
        block_id: "heading",
        block_type: 3,
        heading1: { elements: [{ text_run: { content: "文档标题" } }] },
        children: [],
      },
      {
        block_id: "text",
        block_type: 2,
        text: { elements: [{ text_run: { content: "这是一段正文内容。" } }] },
        children: [],
      },
      {
        block_id: "bullet1",
        block_type: 12,
        bullet: { elements: [{ text_run: { content: "要点一" } }] },
        children: [],
      },
      {
        block_id: "code",
        block_type: 14,
        code: {
          elements: [{ text_run: { content: 'console.log("Hello!");' } }],
          style: { language: 22, wrap: true },
        },
        children: [],
      },
      {
        block_id: "callout",
        block_type: 19,
        callout: { background_color: 4, border_color: 4, emoji_id: "bulb" },
        children: ["callout_text"],
      },
      {
        block_id: "callout_text",
        block_type: 2,
        text: { elements: [{ text_run: { content: "这是高亮块中的内容" } }] },
        children: [],
      },
    ],
  };

  await fetch(
    `${BASE_URL}/docx/v1/documents/${documentId}/blocks/${documentId}/descendant?document_revision_id=-1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(blocks),
    },
  );

  console.log(`文档创建成功: ${documentId}`);
}
```

## 注意事项

1. **API 限制**：每次调用间隔至少 200ms 避免 429 错误
2. **权限要求**：应用需要 `docx:document` 权限，需要获取 `tenant_access_token` 或 `user_access_token`
3. **嵌套块**：高亮块、表格等需要分步创建。使用嵌套块 API 时，自定义的 `block_id` 在文档内必须唯一
4. **父子关系规则**：
   - 只有特定块类型可以作为父块（如 Page、Text、TableCell 等）
   - Page 块不能作为子块添加
   - TableCell 只能通过表格操作添加
5. **表格限制**：
   - 表格单元格内不允许添加 Table、Sheet 等块
   - 分栏列内不允许添加 Grid 块
6. **版本控制**：建议使用 `document_revision_id=-1` 始终操作最新版本
7. **错误处理**：注意处理常见错误码如 400177xxx 系列

## 参考链接

- [飞书文档 API](https://open.larkoffice.com/document/server-docs/docs/docs/docx-v1/docx-overview)
- [Block 数据结构](https://open.larkoffice.com/document/docs/docs/data-structure/block)
