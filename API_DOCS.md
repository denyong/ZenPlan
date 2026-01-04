
# ZenPlan 系统接口文档 (API Documentation)

本文档已根据物理表结构（MySQL 8.0）进行校准，用于指导后端逻辑开发。

## 1. 通用规范

- **Base URL**: `/api/v1`
- **Content-Type**: `application/json`
- **授权方式**: Header 携带 `Authorization: Bearer <JWT_TOKEN>`
- **成功响应格式**: `{ "code": 200, "message": "success", "data": {...} }`

---

## 2. 每周复盘与成长档案 (Weekly Reviews)

成长档案是 ZenPlan 的核心沉淀模块，基于 `(user_id, year, week_number)` 唯一键构建。

### 2.1 获取复盘档案列表 (List Archive)
- **Endpoint**: `GET /reviews`
- **Query Params**: `limit` (可选，默认 20)
- **返回**: `Array<WeeklyReview>`，按年份和周数降序排列。

### 2.2 保存/更新周复盘 (Upsert Review)
- **Endpoint**: `POST /reviews`
- **说明**: 采用 Upsert 逻辑。
- **入参**:
  ```json
  {
    "year": 2025,
    "week_number": 11,
    "wins_content": "String (text)",
    "obstacles_content": "String (text)",
    "next_focus_content": "String (text)"
  }
  ```
- **后端逻辑**:
  1. 权限校验：确保用户只能操作自己的 `user_id`。
  2. 数据库操作：使用 `uk_user_year_week` 索引进行覆盖写。
  3. AI 增强：保存后建议触发异步 Job，调用 Gemini 对该周表现进行“灵魂点评”并存入 `summary_ai`。

### 2.3 获取本周建议 (Contextual AI Prompt)
- **Endpoint**: `GET /reviews/context/current`
- **说明**: 返回本周的任务统计（已完/未完），辅助前端渲染复盘引导。

---

## 3. 统计与 AI 洞察

### 3.1 跨周进化趋势分析 (AI Trends)
- **Endpoint**: `GET /reviews/analysis/trends`
- **说明**: 获取深度 AI 成长报告。
- **返回**: 
  ```json
  {
    "report": "分析文本...",
    "detected_patterns": ["拖延症有所改善", "高估了沟通效率"],
    "next_step_suggestion": "建议下周专注减少会议时间"
  }
  ```

---

## 4. 后端实现指南 (Implementation Guide)

1. **唯一性冲突**: MySQL 层面必须配置 `UNIQUE INDEX uk_user_year_week(user_id, year, week_number)`。
2. **周数逻辑**: 统一使用 `ISO-8601` 标准，周一为周开始。建议后端使用类似 Python `date.isocalendar()` 或 Node `date-fns` 的库。
3. **数据一致性**: 删除用户时，级联删除所有 `weekly_reviews`。
