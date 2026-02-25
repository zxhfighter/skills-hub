const BASE_URL = 'https://open.feishu.cn/open-apis';

const APP_ID = process.env.FEISHU_APP_ID || '';
const APP_SECRET = process.env.FEISHU_APP_SECRET || '';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getTenantAccessToken() {
  const response = await fetch(`${BASE_URL}/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: APP_ID,
      app_secret: APP_SECRET,
    }),
  });

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`获取 access_token 失败: ${data.msg}`);
  }

  return data.tenant_access_token;
}

async function createDocument(accessToken, title, folderToken) {
  const response = await fetch(`${BASE_URL}/docx/v1/documents`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      folder_token: folderToken,
    }),
  });

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`创建文档失败: ${data.msg}`);
  }

  return data.data.document.document_id;
}

async function createBlocks(accessToken, documentId, parentBlockId, children, index = 0) {
  await sleep(200);

  const response = await fetch(
    `${BASE_URL}/docx/v1/documents/${documentId}/blocks/${parentBlockId}/children?document_revision_id=-1`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        children,
        index,
      }),
    }
  );

  const data = await response.json();

  if (data.code !== 0) {
    console.error('API Response:', JSON.stringify(data, null, 2));
    throw new Error(`创建块失败: ${data.msg}`);
  }

  return data.data;
}

async function main() {
  console.log('🚀 开始创建飞书文档...\n');

  if (!APP_ID || !APP_SECRET) {
    console.error('❌ 错误: 请设置环境变量 FEISHU_APP_ID 和 FEISHU_APP_SECRET');
    console.log('\n使用方法:');
    console.log('  FEISHU_APP_ID=xxx FEISHU_APP_SECRET=xxx node feishu-doc-demo.js');
    process.exit(1);
  }

  try {
    console.log('1️⃣ 获取 tenant_access_token...');
    const accessToken = await getTenantAccessToken();
    console.log('   ✅ 获取成功\n');

    console.log('2️⃣ 创建新文档...');
    const documentId = await createDocument(
      accessToken,
      'Block 示例文档 - ' + new Date().toLocaleString('zh-CN')
    );
    console.log('   ✅ 文档创建成功');
    console.log(`   📄 Document ID: ${documentId}`);
    console.log(`   🔗 文档链接: https://bytedance.larkoffice.com/docx/${documentId}\n`);

    console.log('3️⃣ 写入 Block 示例...');

    console.log('   📝 写入标题...');
    await createBlocks(accessToken, documentId, documentId, [
      {
        block_type: 3,
        heading1: {
          elements: [{ text_run: { content: '飞书文档 Block 示例' } }],
        },
      },
    ]);

    console.log('   📝 写入文本（含样式）...');
    await createBlocks(accessToken, documentId, documentId, [
      {
        block_type: 2,
        text: {
          elements: [
            { text_run: { content: '这是一段普通文本，展示 ' } },
            { text_run: { content: '粗体', text_element_style: { bold: true } } },
            { text_run: { content: '、' } },
            { text_run: { content: '斜体', text_element_style: { italic: true } } },
            { text_run: { content: '、' } },
            { text_run: { content: '下划线', text_element_style: { underline: true } } },
            { text_run: { content: ' 等样式。' } },
          ],
          style: { align: 1 },
        },
      },
    ]);

    console.log('   📝 写入无序列表...');
    await createBlocks(accessToken, documentId, documentId, [
      {
        block_type: 12,
        bullet: {
          elements: [{ text_run: { content: '无序列表项 1' } }],
        },
      },
      {
        block_type: 12,
        bullet: {
          elements: [{ text_run: { content: '无序列表项 2' } }],
        },
      },
    ]);

    console.log('   📝 写入有序列表...');
    await createBlocks(accessToken, documentId, documentId, [
      {
        block_type: 13,
        ordered: {
          elements: [{ text_run: { content: '有序列表项 1' } }],
        },
      },
      {
        block_type: 13,
        ordered: {
          elements: [{ text_run: { content: '有序列表项 2' } }],
        },
      },
    ]);

    console.log('   📝 写入代码块...');
    await createBlocks(accessToken, documentId, documentId, [
      {
        block_type: 14,
        code: {
          elements: [
            {
              text_run: {
                content: `function hello() {\n  console.log('Hello, 飞书!');\n}\n\nhello();`,
              },
            },
          ],
          style: {
            language: 22,
            wrap: true,
          },
        },
      },
    ]);

    console.log('   📝 写入引用...');
    await createBlocks(accessToken, documentId, documentId, [
      {
        block_type: 15,
        quote: {
          elements: [
            {
              text_run: {
                content: '这是一段引用文字，可以用来展示名言警句或重要信息。',
              },
            },
          ],
        },
      },
    ]);

    console.log('   📝 写入分割线...');
    await createBlocks(accessToken, documentId, documentId, [
      {
        block_type: 22,
        divider: {},
      },
    ]);

    console.log('   📝 写入高亮块...');
    const calloutResult = await createBlocks(accessToken, documentId, documentId, [
      {
        block_type: 19,
        callout: {
          background_color: 4,
          border_color: 4,
          emoji_id: 'bulb',
        },
      },
    ]);
    const calloutBlockId = calloutResult.children[0].block_id;
    await createBlocks(accessToken, documentId, calloutBlockId, [
      {
        block_type: 2,
        text: {
          elements: [
            {
              text_run: {
                content: '💡 这是一个高亮块，可以用来突出显示重要信息！',
              },
            },
          ],
        },
      },
    ]);

    console.log('   📝 写入表格 (2x2)...');
    const tableResult = await createBlocks(accessToken, documentId, documentId, [
      {
        block_type: 31,
        table: {
          property: {
            row_size: 2,
            column_size: 2,
          },
        },
      },
    ]);
    const tableCellIds = tableResult.children[0].children || [];
    const cellContents = ['表头 1', '表头 2', '数据 1', '数据 2'];
    for (let i = 0; i < tableCellIds.length && i < cellContents.length; i++) {
      await createBlocks(accessToken, documentId, tableCellIds[i], [
        {
          block_type: 2,
          text: {
            elements: [{ text_run: { content: cellContents[i] } }],
          },
        },
      ]);
    }

    console.log('   📝 写入二级标题...');
    await createBlocks(accessToken, documentId, documentId, [
      {
        block_type: 4,
        heading2: {
          elements: [{ text_run: { content: '更多示例' } }],
        },
      },
    ]);

    console.log('   📝 写入待办事项...');
    await createBlocks(accessToken, documentId, documentId, [
      {
        block_type: 17,
        todo: {
          elements: [{ text_run: { content: '待办事项 1' } }],
          style: { done: false },
        },
      },
      {
        block_type: 17,
        todo: {
          elements: [{ text_run: { content: '待办事项 2（已完成）' } }],
          style: { done: true },
        },
      },
    ]);

    console.log('   ✅ 所有 Block 写入成功\n');

    console.log('🎉 飞书文档创建完成！');
    console.log('\n包含的 Block 类型:');
    console.log('   1. 标题 (Heading)');
    console.log('   2. 文本 (Text) - 含粗体/斜体/下划线');
    console.log('   3. 无序列表 (Bullet)');
    console.log('   4. 有序列表 (Ordered)');
    console.log('   5. 代码块 (Code) - JavaScript');
    console.log('   6. 引用 (Quote)');
    console.log('   7. 分割线 (Divider)');
    console.log('   8. 高亮块 (Callout)');
    console.log('   9. 表格 (Table) - 2x2');
    console.log('   10. 二级标题 (Heading2)');
    console.log('   11. 待办事项 (Todo)');
    console.log('   ⚠️  图片 (Image) / 分栏 (Grid) - 需要特殊处理');
    console.log(`\n🔗 打开文档: https://bytedance.larkoffice.com/docx/${documentId}`);
  } catch (error) {
    console.error('❌ 错误:', error.message || error);
    process.exit(1);
  }
}

main();
