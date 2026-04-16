# Clickable Interface Design (UniBuddy)

一个面向 **XJTLU 校园导览** 场景的可交互原型项目，基于 React + Vite 构建。  
项目包含校园地图、路线探索、盲盒路线、自定义路线、集章与收藏等核心功能，适合用于课程展示、交互设计演示和前端原型开发。

## 在线设计稿

- Figma: [Clickable-Interface-Design](https://www.figma.com/design/RLCy2VrVRj7BbKKFs5JFEj/Clickable-Interface-Design)

## 功能亮点

- **沉浸式启动页**：卡通化风格的品牌首屏与引导入口
- **校园主页导航**：快速进入图片地图、路线探索、盲盒路线、自定义路线
- **教室搜索与导航信息**：支持按教室号/楼栋检索并查看步行与楼层指引
- **路线探索系统**：包含推荐路线、盲盒路线（按心情生成）、自定义路线（多点规划）
- **个人中心能力**：路线收藏、打卡集章、拍照记录与进度展示
- **中英双语文本**：内置 `zh/en` 文案资源，方便国际化扩展

## 技术栈

- **框架**：React 18
- **构建工具**：Vite 6
- **路由**：React Router 7
- **样式**：Tailwind CSS 4 + 自定义 CSS
- **组件生态**：Radix UI、MUI、Lucide、Recharts 等

## 快速开始

### 1) 安装依赖

```bash
npm install
```

### 2) 启动开发环境

```bash
npm run dev
```

### 3) 打包生产版本

```bash
npm run build
```

## 项目结构

```text
Clickable_Interface_Design/
├─ src/
│  ├─ app/
│  │  ├─ components/      # 页面与通用组件
│  │  ├─ context/         # 全局状态（收藏、语言、相机等）
│  │  ├─ data/            # 校园/教室等静态数据
│  │  ├─ App.tsx
│  │  └─ routes.tsx       # 路由配置
│  ├─ styles/             # 全局样式与主题
│  └─ main.tsx            # 应用入口
├─ index.html
├─ package.json
└─ vite.config.ts
```

## 可扩展方向

- 接入真实地图 API 与实时定位（GPS）能力
- 路径规划算法升级（避障、无障碍优先、拥挤度避让）
- 登录系统与云端同步（收藏、打卡、照片）
- 将 mock 数据替换为后端服务接口

## 许可证

当前仓库未声明开源许可证。  
如果你计划公开分发，建议补充 `LICENSE` 文件（如 MIT）。
  
