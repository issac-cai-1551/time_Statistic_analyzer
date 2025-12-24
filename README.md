# Time Statistic Analyzer

## 简介

Time Statistic Analyzer 是一个基于 Electron + Vue 3 + FastAPI 的全栈个人时间统计分析工具。它旨在帮助用户记录和分析日常活动的时间消耗，提供直观的可视化报表，并支持桌面悬浮球模式，让时间记录变得无感且高效。

## ✨ 功能特性

**⏱️ 精准计时**: 支持任务的开始、暂停和停止，实时显示已用时间。

**🔮 桌面悬浮球**:
    1. 提供极简的桌面悬浮球模式 (Always on Top)。
    2. 支持任意拖拽移动。
    3. 显示当前任务颜色和时长。
    4. 快速控制：一键开始/停止，双击或点击还原按钮返回主界面。
**🏷️ 分类管理**:
    1. 自定义任务分类，支持设置名称和专属颜色。
    2.  分类数据持久化存储。
**📊 数据可视化**:
    1.  **今日统计**: 通过 ECharts 饼图展示今日时间分布。
    2.  **时间轴**: 清晰展示全天的时间段记录。
**💾 本地存储**: 后端采用 SQLite 数据库，数据安全存储在本地。

## 🛠️ 技术栈

### Frontend (桌面客户端)

**Framework**: [Electron](https://www.electronjs.org/)
**UI Library**: [Vue 3](https://vuejs.org/) + TypeScript
**Build Tool**: [Vite](https://vitejs.dev/)
**State Management**: [Pinia](https://pinia.vuejs.org/)
**Visualization**: [ECharts](https://echarts.apache.org/)
**Routing**: Vue Router (Hash Mode)

### Backend (API 服务)

**Runtime**: Python 3.13+
**Web Framework**: [FastAPI](https://fastapi.tiangolo.com/)
**ORM**: [SQLModel](https://sqlmodel.tiangolo.com/)
**Database**: SQLite

## 🚀 安装与运行

### 前置要求

Node.js (v18+ 推荐)
Python (v3.13+)
[uv](https://github.com/astral-sh/uv) (推荐的 Python 包管理工具，也可使用 pip)

### 1. 后端环境设置

在项目根目录下执行：

```bash
# 使用 uv 同步依赖 (推荐)
uv sync

# 或者使用 pip 安装
pip install fastapi sqlmodel uvicorn
```

**启动后端服务：**

```bash
# 使用 uv
uv run uvicorn backend.main:app --reload

# 或者直接运行 (确保依赖已安装)
uvicorn backend.main:app --reload
```

*后端服务默认运行在 `http://127.0.0.1:8000`*

### 2. 前端环境设置

进入前端目录并安装依赖：

```bash
cd frontend
npm install
```

**启动开发模式 (Electron + Vite)：**

```bash
npm run dev
```

### 3. 构建生产版本 (Build)

构建 Electron 安装包（Windows/Mac/Linux）：

```bash
cd frontend
npm run electron:build
```

构建完成后，安装包将生成在 `frontend/dist_electron` 目录下。
*注意：生产环境运行时，仍需确保后端服务已启动。*

## 📖 使用指南

1. **启动**: 确保后端服务 (`uvicorn`) 正在运行，然后打开 Electron 应用。
2. **计时**:
    1. 在首页 "Timer" 界面，从下拉框选择一个任务分类（或在 "Categories" 页面新建）。
    2. 点击 **Start** 开始计时。
3. **悬浮模式**:
    1. 点击 **Float** 按钮，主窗口隐藏，桌面出现悬浮球。
    2. 悬浮球会显示当前任务的颜色。
    3. 点击悬浮球上的 **▶/■** 按钮控制计时。
    4. 点击 **⤢** 按钮或双击悬浮球可还原主窗口。
4. **查看统计**:
    1. 点击导航栏的 **Stats** 进入统计页面，查看今日的时间分配饼图和详细时间轴。

## 📂 目录结构

```plaintext
.
├── backend/                # Python FastAPI 后端
│   ├── main.py            # API 入口
│   ├── models.py          # 数据库模型
│   └── database.py        # 数据库连接
├── frontend/               # Electron + Vue 前端
│   ├── electron/          # Electron 主进程代码
│   │   └── main.ts        # 窗口与托盘管理
│   ├── src/               # Vue 源码
│   │   ├── api/           # API 请求封装
│   │   ├── components/    # UI 组件
│   │   ├── stores/        # Pinia 状态管理
│   │   └── views/         # 页面视图 (Timer, Stats, FloatView)
│   └── package.json
├── pyproject.toml          # Python 依赖配置
└── README.md
```

## License

MIT
