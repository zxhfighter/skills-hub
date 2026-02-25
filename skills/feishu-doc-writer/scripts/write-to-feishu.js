#!/usr/bin/env node

const BASE_URL = 'https://open.feishu.cn/open-apis';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getTenantAccessToken(appId, appSecret) {
  const response = await fetch(`${BASE_URL}/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });
  const data = await response.json();
  if (data.code !== 0) {
    throw new Error(`获取 access_token 失败: ${data.msg}`);
  }
  return data.tenant_access_token;
}

async function createDocument(accessToken, title, folderToken = null) {
  const body = { title };
  if (folderToken) {
    body.folder_token = folderToken;
  }

  const response = await fetch(`${BASE_URL}/docx/v1/documents`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (data.code !== 0) {
    throw new Error(`创建文档失败: ${data.msg}`);
  }
  return data.data.document.document_id;
}

async function createBlocks(accessToken, documentId, parentBlockId, children, index = 0) {
  await sleep(400);
  const response = await fetch(
    `${BASE_URL}/docx/v1/documents/${documentId}/blocks/${parentBlockId}/children?document_revision_id=-1`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ children, index }),
    }
  );
  const data = await response.json();
  if (data.code !== 0) {
    console.error('Block 创建失败:', JSON.stringify(data, null, 2));
    throw new Error(`创建块失败: ${data.msg}`);
  }
  return data.data;
}

function generateBlockId() {
  return 'blk_' + Math.random().toString(36).substring(2, 15);
}

async function createDescendantBlocks(accessToken, documentId, parentBlockId, childrenIds, descendants) {
  await sleep(400);
  const requestBody = { 
    children_id: childrenIds,
    descendants: descendants,
    index: 0 
  };
  if (process.env.DEBUG) {
    console.log('Descendant 请求体:', JSON.stringify(requestBody, null, 2));
  }
  const response = await fetch(
    `${BASE_URL}/docx/v1/documents/${documentId}/blocks/${parentBlockId}/descendant?document_revision_id=-1`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );
  const data = await response.json();
  if (data.code !== 0) {
    console.error('Descendant 创建失败:', JSON.stringify(data, null, 2));
    throw new Error(`创建嵌套块失败: ${data.msg}`);
  }
  return data.data;
}

const languageMap = {
  javascript: 22, js: 22,
  typescript: 30, ts: 30,
  python: 18, py: 18,
  java: 13,
  go: 10,
  rust: 20,
  c: 2, cpp: 3,
  shell: 23, bash: 23, sh: 23,
  json: 15,
  yaml: 35, yml: 35,
  sql: 25,
  html: 11,
  css: 5,
  markdown: 17, md: 17,
};

function parseInlineStyles(text) {
  const elements = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|~~.*?~~)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push({ text_run: { content: text.slice(lastIndex, match.index) } });
    }

    const matched = match[0];
    if (matched.startsWith('**') && matched.endsWith('**')) {
      elements.push({
        text_run: {
          content: matched.slice(2, -2),
          text_element_style: { bold: true },
        },
      });
    } else if (matched.startsWith('*') && matched.endsWith('*')) {
      elements.push({
        text_run: {
          content: matched.slice(1, -1),
          text_element_style: { italic: true },
        },
      });
    } else if (matched.startsWith('`') && matched.endsWith('`')) {
      elements.push({
        text_run: {
          content: matched.slice(1, -1),
          text_element_style: { inline_code: true },
        },
      });
    } else if (matched.startsWith('~~') && matched.endsWith('~~')) {
      elements.push({
        text_run: {
          content: matched.slice(2, -2),
          text_element_style: { strikethrough: true },
        },
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push({ text_run: { content: text.slice(lastIndex) } });
  }

  return elements.length > 0 ? elements : [{ text_run: { content: text } }];
}

function parseMarkdownTable(lines, startIndex) {
  const rows = [];
  let i = startIndex;
  
  while (i < lines.length && lines[i].includes('|')) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.slice(1, -1).split('|').map(c => c.trim());
      if (!cells.every(c => /^[-:]+$/.test(c))) {
        rows.push(cells);
      }
    }
    i++;
  }
  
  return { rows, endIndex: i };
}

function parseMarkdownToBlocks(markdown) {
  const lines = markdown.split('\n');
  const blocks = [];
  let codeBlock = null;
  let codeLanguage = 1;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    
    if (line.startsWith('```')) {
      if (codeBlock === null) {
        const lang = line.slice(3).trim().toLowerCase();
        codeLanguage = languageMap[lang] || 1;
        codeBlock = [];
      } else {
        blocks.push({
          block_type: 14,
          code: {
            elements: [{ text_run: { content: codeBlock.join('\n') } }],
            style: { language: codeLanguage, wrap: true },
          },
        });
        codeBlock = null;
      }
      i++;
      continue;
    }

    if (codeBlock !== null) {
      codeBlock.push(line);
      i++;
      continue;
    }

    const trimmed = line.trim();
    
    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.includes('|') && trimmed.startsWith('|')) {
      const { rows, endIndex } = parseMarkdownTable(lines, i);
      if (rows.length > 0) {
        blocks.push({
          _type: 'table',
          rows: rows,
        });
        i = endIndex;
        continue;
      }
    }

    if (trimmed.startsWith(':::callout') || trimmed.startsWith('::: callout')) {
      const colorMatch = trimmed.match(/color=(\w+)/);
      const emojiMatch = trimmed.match(/emoji=(\w+)/);
      const colorMap = { red: 1, orange: 2, yellow: 3, green: 4, blue: 5, purple: 6, gray: 7 };
      const color = colorMap[colorMatch?.[1]] || 4;
      const emoji = emojiMatch?.[1] || 'bulb';
      
      const calloutContent = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(':::')) {
        if (lines[i].trim()) {
          calloutContent.push(lines[i].trim());
        }
        i++;
      }
      i++;
      
      blocks.push({
        _type: 'callout',
        color: color,
        emoji: emoji,
        content: calloutContent.join('\n'),
      });
      continue;
    }

    if (trimmed.startsWith(':::grid') || trimmed.startsWith('::: grid')) {
      const colsMatch = trimmed.match(/cols=(\d+)/);
      const columnCount = Math.min(Math.max(parseInt(colsMatch?.[1]) || 2, 2), 4);
      
      const columns = [];
      let currentColumn = [];
      i++;
      
      while (i < lines.length) {
        const gridLine = lines[i].trim();
        if (gridLine === ':::' || gridLine === '::: end') {
          if (currentColumn.length > 0) {
            columns.push(currentColumn.join('\n'));
          }
          i++;
          break;
        }
        if (gridLine === '---col---' || gridLine === ':::col') {
          if (currentColumn.length > 0) {
            columns.push(currentColumn.join('\n'));
          }
          currentColumn = [];
        } else if (gridLine) {
          currentColumn.push(gridLine);
        }
        i++;
      }
      
      if (currentColumn.length > 0 && columns.length < columnCount) {
        columns.push(currentColumn.join('\n'));
      }
      
      while (columns.length < columnCount) {
        columns.push('');
      }
      
      blocks.push({
        _type: 'grid',
        columnCount: columnCount,
        columns: columns.slice(0, columnCount),
      });
      continue;
    }

    if (trimmed.startsWith('# ')) {
      blocks.push({
        block_type: 3,
        heading1: { elements: [{ text_run: { content: trimmed.slice(2) } }] },
      });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({
        block_type: 4,
        heading2: { elements: [{ text_run: { content: trimmed.slice(3) } }] },
      });
    } else if (trimmed.startsWith('### ')) {
      blocks.push({
        block_type: 5,
        heading3: { elements: [{ text_run: { content: trimmed.slice(4) } }] },
      });
    } else if (trimmed.startsWith('#### ')) {
      blocks.push({
        block_type: 6,
        heading4: { elements: [{ text_run: { content: trimmed.slice(5) } }] },
      });
    } else if (trimmed.startsWith('- [ ] ')) {
      blocks.push({
        block_type: 17,
        todo: {
          elements: [{ text_run: { content: trimmed.slice(6) } }],
          style: { done: false },
        },
      });
    } else if (trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
      blocks.push({
        block_type: 17,
        todo: {
          elements: [{ text_run: { content: trimmed.slice(6) } }],
          style: { done: true },
        },
      });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      blocks.push({
        block_type: 12,
        bullet: { elements: parseInlineStyles(trimmed.slice(2)) },
      });
    } else if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s/, '');
      blocks.push({
        block_type: 13,
        ordered: { elements: parseInlineStyles(content) },
      });
    } else if (trimmed.startsWith('> ')) {
      blocks.push({
        block_type: 15,
        quote: { elements: parseInlineStyles(trimmed.slice(2)) },
      });
    } else if (trimmed === '---' || trimmed === '***') {
      blocks.push({ block_type: 22, divider: {} });
    } else {
      const elements = parseInlineStyles(trimmed);
      blocks.push({
        block_type: 2,
        text: { elements },
      });
    }
    
    i++;
  }

  return blocks;
}

async function writeToFeishu(appId, appSecret, title, content, documentId = null, folderToken = null) {
  console.log('🚀 开始写入飞书文档...\n');

  const accessToken = await getTenantAccessToken(appId, appSecret);
  console.log('✅ 获取 access_token 成功');

  let docId = documentId;
  if (!docId) {
    docId = await createDocument(accessToken, title, folderToken);
    console.log(`✅ 创建文档成功: ${docId}`);
  }

  const blocks = parseMarkdownToBlocks(content);
  console.log(`📝 解析到 ${blocks.length} 个 Block`);

  let rootBlockIndex = 0;  // 跟踪根节点的块索引

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    
    if (block._type === 'table') {
      console.log(`   📊 写入表格 (${block.rows.length} 行 x ${block.rows[0]?.length || 0} 列)...`);
      try {
        const tableResult = await createBlocks(accessToken, docId, docId, [
          {
            block_type: 31,
            table: {
              property: {
                row_size: block.rows.length,
                column_size: block.rows[0]?.length || 1,
              },
            },
          },
        ], rootBlockIndex++);
        
        const tableBlock = tableResult.children?.[0];
        if (!tableBlock) {
          console.log('      ⚠️ 表格创建成功但无法获取子块，跳过填充内容');
          continue;
        }
        
        const cellIds = tableBlock.children || [];
        console.log(`      📝 表格包含 ${cellIds.length} 个单元格`);
        
        for (let j = 0; j < cellIds.length; j++) {
          const colCount = block.rows[0]?.length || 1;
          const rowIdx = Math.floor(j / colCount);
          const colIdx = j % colCount;
          const cellContent = block.rows[rowIdx]?.[colIdx] || '';
          
          if (!cellContent.trim()) continue;
          
          try {
            await createBlocks(accessToken, docId, cellIds[j], [
              {
                block_type: 2,
                text: { elements: parseInlineStyles(cellContent) },
              },
            ]);
          } catch (cellError) {
            console.log(`      ⚠️ 单元格 [${rowIdx},${colIdx}] 填充失败: ${cellError.message}`);
          }
        }
      } catch (tableError) {
        console.log(`      ⚠️ 表格创建失败: ${tableError.message}`);
      }
    } else if (block._type === 'callout') {
      console.log(`   💡 写入高亮块...`);
      const calloutResult = await createBlocks(accessToken, docId, docId, [
        {
          block_type: 19,
          callout: {
            background_color: block.color,
            border_color: block.color,
            emoji_id: block.emoji,
          },
        },
      ], rootBlockIndex++);
      
      const calloutBlockId = calloutResult.children[0].block_id;
      await createBlocks(accessToken, docId, calloutBlockId, [
        {
          block_type: 2,
          text: { elements: parseInlineStyles(block.content) },
        },
      ]);  // 子块使用默认 index 0
    } else if (block._type === 'grid') {
      console.log(`   📐 写入分栏 (${block.columnCount} 列)...`);
      try {
        const gridResult = await createBlocks(accessToken, docId, docId, [
          {
            block_type: 24,
            grid: { column_size: block.columnCount },
          },
        ], rootBlockIndex++);
        
        const gridBlock = gridResult.children?.[0];
        if (!gridBlock || !gridBlock.children) {
          throw new Error('无法获取分栏列信息');
        }
        
        const columnBlockIds = gridBlock.children;
        console.log(`      📝 分栏包含 ${columnBlockIds.length} 列`);
        
        for (let c = 0; c < columnBlockIds.length && c < block.columns.length; c++) {
          const content = block.columns[c] || '';
          if (content.trim()) {
            try {
              await createBlocks(accessToken, docId, columnBlockIds[c], [
                {
                  block_type: 2,
                  text: { 
                    elements: parseInlineStyles(content),
                    style: {}
                  },
                },
              ]);
            } catch (colError) {
              console.log(`      ⚠️ 列 ${c + 1} 内容填充失败: ${colError.message}`);
            }
          }
        }
        console.log(`      ✅ 分栏创建成功`);
      } catch (gridError) {
        console.log(`      ⚠️ 分栏创建失败: ${gridError.message}`);
        for (const col of block.columns) {
          if (col.trim()) {
            await createBlocks(accessToken, docId, docId, [
              { block_type: 2, text: { elements: parseInlineStyles(col) } },
            ]);
          }
        }
      }
    } else {
      await createBlocks(accessToken, docId, docId, [block], rootBlockIndex++);
    }
  }

  console.log('✅ 所有 Block 写入成功');

  const docUrl = `https://bytedance.larkoffice.com/docx/${docId}`;
  console.log(`\n🔗 文档链接: ${docUrl}`);

  return { documentId: docId, url: docUrl, accessToken };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log(`
用法: node write-to-feishu.js <markdown_file> [options]

选项:
  --title <title>       文档标题（默认使用文件名）
  --doc-id <id>         写入到已有文档（不提供则创建新文档）
  --folder <token>      创建文档的文件夹 token（不提供则使用默认文件夹）
  --app-id <id>         飞书应用 ID（或设置 FEISHU_APP_ID 环境变量）
  --app-secret <secret> 飞书应用密钥（或设置 FEISHU_APP_SECRET 环境变量）

支持的特殊语法:
  - Markdown 表格 (| 列1 | 列2 |)
  - 高亮块 (:::callout color=green emoji=bulb ... :::)

示例:
  node write-to-feishu.js README.md --title "项目介绍"
  FEISHU_APP_ID=xxx FEISHU_APP_SECRET=xxx node write-to-feishu.js content.md
`);
    process.exit(1);
  }

  const fs = require('fs');
  const path = require('path');

  const filePath = args[0];
  let title = path.basename(filePath, path.extname(filePath));
  let documentId = null;
  let folderToken = process.env.DEFAULT_FOLDER_TOKEN || null;
  let appId = process.env.FEISHU_APP_ID;
  let appSecret = process.env.FEISHU_APP_SECRET;

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--title':
        title = args[++i];
        break;
      case '--doc-id':
        documentId = args[++i];
        break;
      case '--folder':
        folderToken = args[++i];
        break;
      case '--app-id':
        appId = args[++i];
        break;
      case '--app-secret':
        appSecret = args[++i];
        break;
    }
  }

  if (!appId || !appSecret) {
    console.error('❌ 请提供飞书应用凭证（--app-id 和 --app-secret 或设置环境变量）');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`❌ 文件不存在: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  try {
    await writeToFeishu(appId, appSecret, title, content, documentId, folderToken);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { writeToFeishu, parseMarkdownToBlocks, createBlocks, getTenantAccessToken, createDocument };
