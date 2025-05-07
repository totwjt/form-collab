# Form-Collab 项目上下文

## 项目概述
Form-Collab 是一个基于 Vue 3 的协同编辑组件库，允许用户为任意表单字段或 DOM 元素绑定唯一 key，实现多人同时在线协同编辑，显示"正在编辑中"的提示，并避免同时编辑冲突。

## 技术栈
- 前端：Vue 3
- 后端：Node.js (Express)
- 包管理：pnpm
- 项目架构：Monorepo
- 通信：WebSocket

## 项目结构
```
packages/
  ├── core/         # 核心业务逻辑
  │   ├── src/
  │   │   ├── types/           # 类型定义
  │   │   │   ├── user.ts      # 用户相关类型
  │   │   │   └── message.ts   # 消息相关类型
  │   │   ├── modules/         # 核心模块
  │   │   │   ├── user/        # 用户模块
  │   │   │   └── message/     # 消息模块
  │   │   └── index.ts         # 主入口
  ├── server/       # Node.js WebSocket 服务
  ├── vue/          # Vue 组件实现
  └── utils/        # 工具函数
```

## 核心模块说明

### 用户模块 (modules/user)
- 管理用户状态和认证
- 提供用户相关的 API 和状态管理
- 主要类型：
  ```typescript
  interface User {
    id: number
    name: string
    email: string
  }

  interface FormUser {
    id: string
    name: string
  }
  ```

### 消息模块 (modules/message)
- 处理 WebSocket 通信
- 管理表单状态和字段锁定
- 主要类型：
  ```typescript
  interface FormMessage {
    type: 'update' | 'lock' | 'unlock' | 'error'
    data: {
      field?: string
      value?: any
      user?: FormUser
      error?: string
    }
  }

  interface FormState {
    data: FormData
    lockedFields: Map<string, FormUser>
    users: Map<string, FormUser>
  }
  ```

## 关键功能
1. 基于 ID 的区域协同
   - 每个区域通过唯一 Key 实现协同锁
   - 支持任意 DOM 元素绑定

2. 编辑中状态提示
   - 他人编辑时自动禁用
   - 显示"某某正在编辑"提示

3. 状态同步机制
   - 基于 WebSocket 的实时通信
   - 实时同步编辑状态

## 开发注意事项
1. 代码组织
   - 使用模块化结构
   - 清晰的类型定义
   - 分离业务逻辑和通信逻辑

2. 类型安全
   - 使用 TypeScript 类型系统
   - 避免使用 any 类型
   - 保持类型定义的一致性

3. 状态管理
   - 使用 Map 存储锁定状态
   - 实现乐观更新
   - 处理并发冲突

4. WebSocket 通信
   - 实现重连机制
   - 消息队列处理
   - 错误处理

## 待优化项
1. 完善错误处理机制
2. 添加单元测试
3. 优化性能和用户体验
4. 添加更多协同编辑场景支持
5. 完善文档和示例