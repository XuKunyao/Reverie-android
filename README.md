# Reverie

![Expo SDK](https://img.shields.io/badge/Expo-SDK%2054-8B7CF6?style=flat-square&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Android](https://img.shields.io/badge/Android-Target-3DDC84?style=flat-square&logo=android&logoColor=white)
![Status](https://img.shields.io/badge/Status-MVP%20in%20progress-D97757?style=flat-square)

Reverie 是一个温暖、安静、克制的喝水提醒应用。它的目标不是制造更多打扰，而是在合适的时间轻轻提醒你补充水分，并用清晰的记录帮助你了解今天的饮水状态。

当前版本是第一阶段 MVP，重点放在基础体验：今日进度、快速记录、本地存储、极简设置和本地提醒。

## Features

- 今日饮水进度：用圆形进度展示当前饮水量和每日目标。
- 快速记录：点击“喝了一杯”即可记录默认杯量。
- 今日记录：展示每次饮水的时间和毫升数。
- 极简设置：支持设置每日目标、单次饮水量和提醒间隔。
- 本地提醒：通过 Expo 本地通知定时提醒喝水。
- 本地持久化：记录和设置保存在设备本地。

## Design

Reverie 的视觉方向是温暖、轻量、留白充足。界面避免强刺激色彩和复杂装饰，把注意力放在“今天喝了多少水”这一件事上。

核心色彩定义在 [`constants/theme.ts`](constants/theme.ts)：

- Background: `#F5F0E8`
- Surface: `#FDFAF4`
- Primary: `#D97757`
- Text: `#1A1612`
- Secondary Text: `#6B6560`
- Border: `#E8E2D9`

## Tech Stack

- [Expo](https://expo.dev/)：开发、运行和预览 React Native 应用。
- [React Native](https://reactnative.dev/)：跨平台移动端界面框架。
- [Expo Router](https://docs.expo.dev/router/introduction/)：基于文件的路由系统。
- [TypeScript](https://www.typescriptlang.org/)：提供类型检查。
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)：本地键值存储。
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)：本地通知提醒。
- [React Native SVG](https://github.com/software-mansion/react-native-svg)：绘制圆形进度。

## Getting Started

安装依赖：

```bash
npm install
```

启动 Expo 开发服务器：

```bash
npm run start
```

在 Windows PowerShell 如果遇到 `npm.ps1 cannot be loaded`，可以使用：

```bash
npm.cmd run start
```

然后可以选择：

- 用 Expo Go 扫码在手机上预览。
- 在终端按 `a` 打开 Android 模拟器。
- 运行 `npm.cmd run web` 在浏览器中快速查看 Web 预览。

## Project Structure

```text
app/
  _layout.tsx              # 应用入口：字体、通知、全局状态
  (tabs)/
    _layout.tsx            # 底部 Tab 导航
    index.tsx              # 首页：进度、按钮、记录
    settings.tsx           # 设置页：目标、杯量、提醒间隔
components/
  GreetingHeader.tsx       # 时间问候
  WaterProgress.tsx        # 圆形进度
  WaterLogItem.tsx         # 单条饮水记录
constants/
  theme.ts                 # 设计系统
contexts/
  WaterContext.tsx         # 全局饮水状态
utils/
  notifications.ts         # 本地提醒
  storage.ts               # 本地存储
```

## Development Checks

提交代码前建议运行：

```bash
npm.cmd run lint
npx.cmd tsc --noEmit
npx.cmd expo install --check
```

这些命令分别用于检查代码规范、TypeScript 类型和 Expo 依赖版本兼容性。

## Roadmap

- [x] 首页饮水进度
- [x] 快速添加饮水记录
- [x] 今日记录列表
- [x] 设置每日目标、杯量和提醒间隔
- [x] 本地通知提醒
- [ ] 增加历史统计视图
- [ ] 增加每周/月度趋势
- [ ] 增加自定义提醒时间段
- [ ] 增加应用图标和启动页视觉打磨
- [ ] 评估是否迁移到原生后台任务方案

## Git Notes

常用流程：

```bash
git status --short --branch
git add -A
git commit -m "docs: update project readme"
git push origin main
```

含义：

- `git status --short --branch`：查看当前分支和改动状态。
- `git add -A`：把所有改动加入暂存区。
- `git commit -m "..."`：创建一次本地提交。
- `git push origin main`：推送到 GitHub 的 `main` 分支。
