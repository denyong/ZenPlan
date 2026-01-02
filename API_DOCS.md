# ZenPlan 系统接口文档 (API Documentation)

本文档旨在为 ZenPlan 前端系统提供标准化的 RESTful API 接口规范，确保前端与后端的无缝对接。

## 1. 通用规范

- **Base URL**: `/api/v1`
- **Content-Type**: `application/json`
- **授权方式**: 在 Header 中携带 `Authorization: Bearer <JWT_TOKEN>`
- **标准响应结构**:
```json
{
  "code": 200,          // 状态码：200成功, 400参数错误, 401未授权, 500服务器错误
  "message": "success", // 提示信息
  "data": {}            // 核心返回内容
}
```

---

## 2. 用户模块 (Auth & User)

### 2.1 用户注册
- **Endpoint**: `POST /auth/register`
- **入参**: `username`, `email`, `password`
- **返回**: 成功状态码及基础用户信息。

### 2.2 用户登录
- **Endpoint**: `POST /auth/login`
- **入参**: `email`, `password`
- **返回**: 
  ```json
  {
    "token": "jwt_string",
    "user": { "id": 1, "username": "Alex Rivera", "email": "alex@example.com" }
  }
  ```

---

## 3. 目标管理模块 (Goals)

### 3.1 获取目标列表
- **Endpoint**: `GET /goals`
- **Query 参数**:
  - `level`: 可选 (long, mid, short)
  - `status`: 可选 (pending, completed, delayed, abandoned)
  - `search`: 模糊匹配标题或描述
- **返回**: `Array<Goal>`

### 3.2 创建新目标
- **Endpoint**: `POST /goals`
- **入参**:
  ```json
  {
    "title": "String",
    "description": "String",
    "level": "long | mid | short",
    "parent_id": "Number (Optional)",
    "deadline": "Datetime (Optional)"
  }
  ```

### 3.3 更新目标详情
- **Endpoint**: `PUT /goals/:id`
- **说明**: 用于修改进度 (`progress`)、状态 (`status`) 或标题。

### 3.4 删除目标
- **Endpoint**: `DELETE /goals/:id`

---

## 4. 待办事项模块 (Todos)

### 4.1 获取待办列表
- **Endpoint**: `GET /todos`
- **Query 参数**:
  - `goal_id`: 过滤特定目标
  - `is_completed`: 0 或 1
  - `search`: 关键词搜索
- **返回**: `Array<Todo>`

### 4.2 创建待办事项
- **Endpoint**: `POST /todos`
- **入参**:
  ```json
  {
    "goal_id": "Number (Optional)",
    "title": "String",
    "description": "String (Optional)",
    "priority": "high | medium | low",
    "estimated_time": "Number (Minutes)",
    "due_date": "Datetime"
  }
  ```

### 4.3 切换状态 (快捷接口)
- **Endpoint**: `PATCH /todos/:id/toggle`
- **逻辑**: 自动切换 `is_completed`。若设为已完成，后端需自动更新 `completed_at`。

### 4.4 删除待办事项
- **Endpoint**: `DELETE /todos/:id`

---

## 5. 每周复盘模块 (Weekly Reviews)

### 5.1 获取复盘记录
- **Endpoint**: `GET /reviews/:year/:week_number`

### 5.2 保存/更新复盘
- **Endpoint**: `POST /reviews`
- **逻辑**: Upsert 操作（根据用户ID、年份、周数匹配）。
- **入参**:
  ```json
  {
    "year": 2026,
    "week_number": 1,
    "wins_content": "String",
    "obstacles_content": "String",
    "next_focus_content": "String"
  }
  ```

---

## 6. 统计分析模块 (Statistics)

### 6.1 仪表盘摘要
- **Endpoint**: `GET /stats/dashboard/summary`
- **返回**: `total_goals`, `completed_todos_today`, `weekly_efficiency`, `streak_days`。

### 6.2 执行趋势数据
- **Endpoint**: `GET /stats/trend`
- **返回**: 过去 7 天每天的完成数与待办数统计。

### 6.3 目标覆盖率分析
- **Endpoint**: `GET /stats/goals/coverage`
- **返回**: 已关联目标的任务比例及各层级目标进度均值。

---

## 7. 后端实现建议

1. **层级联动**: 建议在 `todos` 表更新时，通过 Hooks 或触发器自动计算所属 `goals` 的平均进度。
2. **数据一致性**: 删除目标时应根据业务需求决定是级联删除 Todo 还是解除关联。
3. **时区处理**: 所有的 `Datetime` 建议统一使用 UTC 时间存储，前端负责本地化展示。