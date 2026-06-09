# 巡梦 ChasingDream

《巡梦》是一个围绕梦境碎片记录、Agent 拼合、SQLite 持久化和日历回看的 Web Demo。用户输入“梦者名”进入自己的梦境空间，可以用文字或浏览器语音转文字补充梦境片段，由大模型 Agent 整理成故事、情绪、关键词和温柔追问。

## 文档入口

- [PRD](docs/PRD.md)
- [产品上下文](PRODUCT.md)
- [设计系统 Seed](DESIGN.md)
- [前端风格设计](docs/superpowers/specs/2026-06-09-frontend-style-design.md)
- [前端体验 Spec](docs/superpowers/specs/2026-06-09-frontend-experience-spec.md)
- [数据与 API Spec](docs/superpowers/specs/2026-06-09-data-api-spec.md)
- [Agent 契约 Spec](docs/superpowers/specs/2026-06-09-agent-contract-spec.md)

## 技术栈

- Next.js + React + TypeScript
- Next.js API Routes / Route Handlers
- SQLite，本地数据库文件：`data/chasing-dream.sqlite`
- OpenAI-compatible API
- Browser Web Speech API

## 环境变量

实现后在项目根目录创建 `.env.local`：

```env
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1-mini
```

注意：API Key 只能在服务端使用，前端不得直接调用大模型 API。

## 本地运行

实现 Next.js 应用后，按以下方式启动：

```bash
npm install
npm run dev
```

默认访问：

```text
http://localhost:3000
```

首次运行时，服务端应自动创建 `data/chasing-dream.sqlite` 并初始化 `dreamers`、`dreams` 表。

## 生产构建

```bash
npm run build
npm run start
```

部署前确认：

- `.env.local` 或部署平台环境变量已配置。
- `data/` 目录具备写入权限。
- 生产环境不会把 `.env*`、SQLite 数据库、日志文件提交到 Git。
- 前端页面刷新后能通过 `localStorage` 恢复当前 dreamer。

## 部署方法

### 方式一：本机或内网服务器部署

适合 Demo 演示、内网评审和本地优先场景。

```bash
npm install
npm run build
npm run start
```

如果需要指定端口：

```bash
PORT=3000 npm run start
```

Windows PowerShell：

```powershell
$env:PORT=3000
npm run start
```

### 方式二：VPS 部署

1. 拉取代码到服务器。
2. 安装 Node.js LTS。
3. 配置环境变量。
4. 运行 `npm install` 和 `npm run build`。
5. 使用 `pm2`、systemd 或平台进程管理工具运行 `npm run start`。
6. 用 Nginx/Caddy 反向代理到应用端口。
7. 将 `data/` 目录放在持久化磁盘，并定期备份 SQLite 文件。

### 方式三：Railway / Render / Fly.io

适合快速在线演示。

1. 连接 Git 仓库。
2. 设置构建命令：`npm run build`。
3. 设置启动命令：`npm run start`。
4. 配置 `OPENAI_API_KEY`、`OPENAI_BASE_URL`、`OPENAI_MODEL`。
5. 配置持久化卷或挂载目录保存 `data/chasing-dream.sqlite`。

如果平台没有持久化磁盘，SQLite 数据会在实例重建后丢失。此时应改用 Turso/libSQL 等线上 SQLite 方案。

## 演示路径

1. 输入梦者名“小林”进入应用。
2. 输入第一段梦境碎片。
3. 使用语音输入补充第二段碎片。
4. 查看 Agent 生成的故事、关键词气泡和追问。
5. 打开碎片匣查看原始输入。
6. 保存梦境。
7. 进入日历，打开今天的梦境详情。
8. 切换梦者“小周”，确认看不到“小林”的梦境。
9. 切回“小林”，确认历史梦境仍存在。

## 产品介绍

- 记录与录入：用户用文字或浏览器语音转文字提交梦境碎片，Agent 将片段拼合为可保存的梦境故事。
- 管理与回顾：历史梦境按日期进入日历视图，并可从日期列表打开沉浸式详情页复盘。
- 持久化与隔离：梦境写入 SQLite，并通过 dreamerId 绑定不同梦者的数据。
- 情绪关联：Agent 提取主情绪、情绪强度、关键词和氛围配置，用温柔反馈承接梦境感受。
- 稳定演示：本地 Next.js 服务、真实模型接口和 SQLite 数据库组成可现场走通的 Demo 闭环。
