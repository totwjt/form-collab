# Form-Collab 协同编辑组件库需求文档

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
  ├── server/       # Node.js (Express) WebSocket 服务
  ├── schema-form/  # JSON Schema 动态表单渲染（后续计划）
  └── vue/          # Vue 组件实现
```

## 使用方式
```bash
# 安装
pnpm add @form-collab/vue
```

```vue
<!-- 使用示例 -->
<div v-collab="'section-1'">区域编辑</div>
<a-input v-collab="'username'" />
```

## 核心功能
1. 基于 ID 的区域协同
   - 每个区域通过唯一 Key 实现协同锁
   - 支持任意 DOM 元素绑定

2. 编辑中状态提示
   - 他人编辑时自动禁用
   - 显示"某某正在编辑"提示

3. JSON Schema 表单支持
   - 结合动态表单实现结构化协同编辑
   - 支持合同、调查表等场景

4. 状态同步机制
   - 基于 WebSocket 的实时通信
   - 实时同步编辑状态

5. 跨表单/页面结构支持
   - 支持表单字段
   - 支持分组、卡片、区域等任意结构

## 技术实现要点
1. 协同锁机制
   - 基于 WebSocket 的实时锁管理
   - 自动释放机制
   - 冲突处理策略

2. 状态管理
   - 编辑状态追踪
   - 用户信息管理
   - 实时状态同步

3. 组件设计
   - 指令式 API
   - 组件式 API
   - 可扩展的插件系统

4. 性能优化
   - 按需加载
   - 状态缓存
   - 批量更新

## 后续计划
1. 完善文档和示例
2. 添加单元测试
3. 实现 JSON Schema 表单支持
4. 优化性能和用户体验
5. 添加更多协同编辑场景支持