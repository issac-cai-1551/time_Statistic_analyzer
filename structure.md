# 时间统计分析器

我希望实现一个个人时间计时器，功能是

- 在使用时可以选择“开始计时”和“停止计时”
- 可以悬浮式的显示一个计时的小浮窗在桌面上，同时支持标记"时间类型"的功能。
- 正式的界面在网页端显示，可以查看每日总计时时长和各时长占比，并且可以统计数据后让大语言模型进行分析和反馈(我拥有本地ollama运行的大预言模型)。

整体架构如下：
┌────────────────────────┐
│    桌面应用（Electron） │
│ ┌──────────┐ ┌───────┐│
│ │ 悬浮窗UI │ │ Web UI││
│ └────┬─────┘ └───┬───┘│
└──────┼───────────┼────┘
       │ HTTP
┌──────▼────────────────┐
│   本地后端（FastAPI）  │
│  - 计时逻辑            │
│  - 数据统计            │
│  - LLM 分析接口        │
└──────┬────────────────┘
       │ ORM
┌──────▼────────────────┐
│   SQLite 数据库        │
└────────────────────────┘
       │
┌──────▼────────────────┐
│   Ollama（本地模型）   │
└────────────────────────┘

## 后端设计

事件级数据为：
StudySession{
id
start_time
category   // 时间类型
created_at
}

时间类型为：

```python
from sqlmodel import SQLModel, Field
from typing import Optional

class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    # 程序级稳定标识（前端只用这个）
    key: str = Field(index=True, unique=True)
    # 展示名（用户可改）
    name: str
    # 当前默认颜色（用于新记录）
    color: Optional[str] = None  # e.g. "#3B82F6"
    # 是否可用（逻辑删除）
    is_active: bool = True
```

用于每日统计的数据结构为:

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional


class TimeRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    # 时间事实
    start_time: datetime
    end_time: datetime
    duration_seconds: int

    # 用于快速按天统计（冗余但必要）
    date: str  # YYYY-MM-DD

    # 分类内部关联（用于管理 / 合并）
    category_id: Optional[int]

    # ===== 快照字段（核心） =====
    category_key: Optional[str]
    category_name: str
    category_color: Optional[str]

    created_at: datetime = Field(default_factory=datetime.utcnow)

```

## 前端设计

决定采用如下前端技术构建网站：
框架：Vue 3 + Composition API
构建：Vite
HTTP：axios
图表：ECharts 或 Chart.js（任选）

目录结构如下：

frontend/
├─ src/
│  ├─ api/
│  │  ├─ timer.ts
│  │  ├─ stats.ts
│  │  └─ category.ts
│  │
│  ├─ views/
│  │  ├─ TimerView.vue
│  │  ├─ TodayStatsView.vue
│  │  └─ CategoryManageView.vue
│  │
│  ├─ components/
│  │  ├─ TimerControl.vue
│  │  ├─ CategorySelect.vue
│  │  └─ StatsChart.vue
│  │
│  ├─ stores/
│  │  └─ timerStore.ts
│  │
│  ├─ router/
│  │  └─ index.ts
│  │
│  ├─ App.vue
│  └─ main.ts
