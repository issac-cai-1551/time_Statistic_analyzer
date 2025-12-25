# Time Statistic Analyzer

## 简介

Time Statistic Analyzer 是一个基于 Electron + Vue 3 + FastAPI 的全栈个人时间统计分析工具。它旨在帮助用户记录和分析日常活动的时间消耗，提供直观的可视化报表，并支持桌面悬浮球模式，让时间记录变得无感且高效。

## ✨ 功能特性

**⏱️ 精准计时**: 支持任务的开始、暂停和停止，实时显示已用时间。
**🔮 桌面悬浮球**:
    - 提供极简的桌面悬浮球模式 (Always on Top)。
    - 支持任意拖拽移动。
    - 显示当前任务颜色和时长（未分类任务显示默认蓝色）。
    - 快速控制：一键开始/停止，双击或点击还原按钮返回主界面。
**实时同步**：主界面修改分类或计时状态，悬浮球即时更新。
**🏷️ 分类管理**:
    -   自定义任务分类，支持设置名称和专属颜色。
    -   支持逻辑删除（归档）不再使用的分类。
**📊 数据可视化**:
    -   **今日统计**: 通过 ECharts 饼图展示今日时间分布。
    -   **时间轴**: 清晰展示全天的时间段记录。
**💾 本地存储**: 后端采用 SQLite 数据库 (`time_tracker_v2.db`)，数据安全存储在本地。
**📦 便携/安装**: 提供免安装绿色版和标准安装包，开箱即用。

## 🛠️ 技术栈

### Frontend (桌面客户端)

**Framework**: [Electron](https://www.electronjs.org/) (v39+)
**UI Library**: [Vue 3](https://vuejs.org/) + TypeScript
**Build Tool**: [Vite](https://vitejs.dev/)
**State Management**: [Pinia](https://pinia.vuejs.org/)
**Visualization**: [ECharts](https://echarts.apache.org/)
**Packaging**: [electron-builder](https://www.electron.build/)

### Backend (API 服务)

**Runtime**: Python 3.13+
**Web Framework**: [FastAPI](https://fastapi.tiangolo.com/)
**ORM**: [SQLModel](https://sqlmodel.tiangolo.com/)
**Database**: SQLite
**Packaging**: [PyInstaller](https://pyinstaller.org/)

## 🚀 开发与运行

### ⚠️ 注意事项 (Ignored Files)
本项目为了保持仓库轻量，**忽略**了以下文件，请在运行前根据指引自行生成或下载：
1.  **依赖库**: `node_modules` 和 `.venv` (需安装依赖)。
2.  **后端程序**: `dist/api_server.exe` (需手动构建)。
3.  **构建资源**: `frontend/build/icon.png` (构建安装包时需要)。
4.  **数据库**: `time_tracker_v2.db` (运行时自动生成)。

### 前置要求

- Node.js (v18+ 推荐)
- Python (v3.13+)
- [uv](https://github.com/astral-sh/uv) (推荐) 或 pip

### 1. 启动后端 (开发模式)

```bash
# 使用 uv 启动 (推荐)
uv run uvicorn backend.main:app --reload

# 或使用标准命令
uvicorn backend.main:app --reload
```

默认端口: 8000

### 2. 启动前端 (开发模式)

```bash
cd frontend
npm install
npm run dev
```

## 📦 构建生产版本 (Build)

构建过程分为两步：先打包后端为 exe，再打包前端 Electron 应用。

### 第一步：打包后端

在项目根目录下运行：

```bash
# 生成 api_server.exe
uv run pyinstaller --name=api_server --onefile --clean run_backend.py
```

*产物位于 `dist/api_server.exe`*

### 第二步：打包前端 & 整合

**准备图标资源** (首次构建前执行):
```bash
# 在 frontend 目录下
mkdir build
# Windows PowerShell
Copy-Item public/icon.png build/icon.png
```

**执行构建**:
```bash
cd frontend
npm run electron:build
```

**绿色版 (Portable)**: `frontend/dist_electron/win-unpacked/TimeStatisticAnalyzer.exe`
**安装包 (Setup)**: `frontend/dist_electron/TimeStatisticAnalyzer Setup X.X.X.exe`

> **注意**: 构建后的程序会自动管理后端进程，**无需**手动运行 Python 服务。

## ❓ 常见问题 (Troubleshooting)

### 1. 运行闪退或白屏

**端口冲突**: 请检查 `8000` 端口是否被其他程序占用。
**杀毒软件**: 某些杀毒软件可能会拦截未签名的 `api_server.exe`，请尝试添加信任。
**日志查看**: 在命令行中运行程序以查看详细报错：

```powershell
.\TimeStatisticAnalyzer.exe --enable-logging
```

### 2. GPU process exited unexpectedly

程序已默认禁用硬件加速 (`app.disableHardwareAcceleration()`) 以解决部分 Windows 环境下的显卡兼容性问题。

### 3. 数据库文件在哪里？

**开发环境**: 项目根目录下的 `time_tracker_v2.db`。
**生产环境**: 位于`C:\Users\<用户名>\AppData\Roaming\time_statistic_analyzer\`

## 📄 License

MIT

## 📖 使用指南

1. **启动**: 双击文件夹内的time_statistic_analyzer.exe。
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
