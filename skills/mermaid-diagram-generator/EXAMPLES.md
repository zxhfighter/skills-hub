# 使用示例

## 在 OpenClaw 中的对话示例

### 示例 1：创建简单的流程图

**用户**：生成一个流程图，显示用户登录系统的流程

**小红帽**：我来为你生成一个用户登录的流程图。

生成的流程图：
```mermaid
graph TD
    A[用户访问系统] --> B[输入用户名密码]
    B --> C{验证凭据}
    C -->|成功| D[登录成功]
    C -->|失败| E[显示错误信息]
    E --> B
    D --> F[进入主页]
```

### 示例 2：创建序列图

**用户**：创建一个序列图，展示电商系统中用户下单的交互

**小红帽**：好的，我来生成电商下单的序列图。

生成的序列图：
```mermaid
sequenceDiagram
    participant 用户
    participant 前端
    participant 后端
    participant 数据库

    用户->>前端: 提交订单
    前端->>后端: POST /api/order
    后端->>数据库: 创建订单记录
    数据库-->>后端: 返回订单 ID
    后端-->>前端: 返回订单详情
    前端-->>用户: 显示订单确认
```

### 示例 3：创建甘特图

**用户**：帮我做一个项目甘特图，包括需求分析、设计、开发、测试阶段

**小红帽**：我来生成项目各阶段的甘特图。

生成的甘特图：
```mermaid
gantt
    title 项目开发计划
    dateFormat YYYY-MM-DD
    section 需求分析
    需求调研: req1, 2024-01-01, 7d
    需求文档: req2, after req1, 3d
    section 设计
    系统设计: des1, after req2, 5d
    UI 设计: des2, after req2, 5d
    section 开发
    后端开发: dev1, after des1, 14d
    前端开发: dev2, after des2, 14d
    section 测试
    单元测试: test1, after dev1, 5d
    集成测试: test2, after dev2, 5d
```

### 示例 4：创建类图

**用户**：生成一个博客系统的类图

**小红帽**：好的，我来生成博客系统的类结构图。

生成的类图：
```mermaid
classDiagram
    class User {
        +int id
        +String username
        +String email
        +login()
        +logout()
    }
    class Post {
        +int id
        +String title
        +String content
        +publish()
        +edit()
    }
    class Comment {
        +int id
        +String content
        +add()
        +delete()
    }
    User "1" --> "many" Post: 写作
    Post "1" --> "many" Comment: 包含
    User "1" --> "many" Comment: 发表
```

### 示例 5：创建状态图

**用户**：生成一个订单状态的状态图

**小红帽**：我来生成订单的状态转换图。

生成的状态图：
```mermaid
stateDiagram-v2
    [*] --> 待支付
    待支付 --> 已支付: 支付成功
    待支付 --> 已取消: 超时未支付
    已支付 --> 待发货: 确认订单
    待发货 --> 已发货: 发出商品
    已发货 --> 已签收: 用户签收
    已发货 --> 退款中: 申请退款
    退款中 --> 已退款: 退款成功
    已签收 --> [*]
    已退款 --> [*]
    已取消 --> [*]
```

### 示例 6：创建 ER 图

**用户**：生成一个简单的电商数据库 ER 图

**小红帽**：好的，我来生成电商数据库的关系图。

生成的 ER 图：
```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : 下单
    ORDER ||--|{ ORDER_ITEM : 包含
    PRODUCT ||--o{ ORDER_ITEM : 被购买
    CATEGORY ||--|{ PRODUCT : 包含
    CUSTOMER }|..|{ ADDRESS : 使用
```

### 示例 7：创建思维导图

**用户**：生成一个关于 AI 技术的思维导图

**小红帽**：我来生成 AI 技术的思维导图。

生成的思维导图：
```mermaid
mindmap
  root((AI 技术))
    机器学习
      监督学习
      无监督学习
      强化学习
    深度学习
      CNN
      RNN
      Transformer
    自然语言处理
      文本分类
      机器翻译
      情感分析
    计算机视觉
      图像识别
      目标检测
      图像生成
    应用领域
      医疗
      金融
      自动驾驶
      教育
```

### 示例 8：创建饼图

**用户**：生成一个展示编程语言使用比例的饼图

**小红帽**：我来生成编程语言使用分布的饼图。

生成的饼图：
```mermaid
pie title 编程语言使用比例
    "JavaScript" : 35
    "Python" : 25
    "Java" : 20
    "C++" : 10
    "Others" : 10
```

## 技巧提示

1. **描述要清晰**：详细描述你想要展示的内容，这样生成的图表会更准确
2. **指定类型**：如果知道要生成什么类型的图表，可以直接说"生成一个流程图/序列图/甘特图等"
3. **提供数据**：如果有具体的数据，可以一起提供，这样图表会更准确
4. **逐步细化**：可以先生成简单版本，然后根据需要添加更多细节

## 常见场景

- 系统架构设计：使用流程图和序列图
- 项目管理：使用甘特图
- 软件设计：使用类图和 ER 图
- 状态管理：使用状态图
- 数据展示：使用饼图
- 知识整理：使用思维导图
