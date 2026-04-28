# Reverie

Reverie 是一个温暖、安静的喝水提醒应用。第一阶段目标很克制：记录今日饮水、显示圆形进度、设置每日目标/单次水量/提醒间隔，并通过本地通知提醒自己喝水。

## 为什么这样搭建

这个项目使用 Expo + React Native，而不是一开始就写原生 Android/Kotlin。

原因很简单：

1. 你是安卓开发新手，Expo 可以先避开复杂的 Gradle、Manifest、原生权限配置。
2. 当前功能主要是界面、本地存储和本地通知，Expo 已经能覆盖第一阶段需求。
3. 你提到的 Android WorkManager 更偏原生层。这个阶段我用 `expo-notifications` 做重复本地通知；后续如果你需要更强的后台可靠性，再迁移到开发构建或原生模块更合适。

## 视觉原则

核心设计语言集中在 `constants/theme.ts`：

- 背景：`#F5F0E8`
- 卡片：`#FDFAF4`
- 品牌色：`#D97757`
- 文字：`#1A1612` / `#6B6560`
- 边框：`#E8E2D9`

界面避免纯白、冷蓝、霓虹色和强阴影。图标使用细线风格，动效和布局都尽量克制。

## 目录说明

- `app/_layout.tsx`：应用入口，加载 DM Sans 字体、配置通知、挂载全局状态。
- `app/(tabs)/index.tsx`：首页，展示问候语、今日进度、喝水按钮和记录列表。
- `app/(tabs)/settings.tsx`：设置页，管理目标水量、单次饮水量、提醒间隔。
- `contexts/WaterContext.tsx`：全局饮水状态。它负责新增记录、删除记录、更新设置。
- `utils/storage.ts`：本地存储。今日饮水记录按日期保存，设置单独保存。
- `utils/notifications.ts`：本地提醒通知。
- `components/WaterProgress.tsx`：圆形饮水进度。
- `components/GreetingHeader.tsx`：根据时间显示问候语。
- `components/WaterLogItem.tsx`：单条饮水记录。

## 如何运行

先安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run start
```

然后可以用 Expo Go 扫码，或在终端里按 `a` 打开安卓模拟器。

如果 PowerShell 提示 `npm.ps1 cannot be loaded`，可以改用：

```bash
npm.cmd run start
```

## 开发检查

每次改完代码，可以运行：

```bash
npm.cmd run lint
npx.cmd tsc --noEmit
```

`lint` 检查代码风格和常见错误；`tsc` 检查 TypeScript 类型是否安全。
