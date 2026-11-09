# 无名杀（斗转星移整合版）→ iOS APP 云编译工程

把本地 `noname-1.10.17.4.1`（2.5GB，含全部扩展与素材）打包成 iPhone 上可玩的 APP。
原理：**Capacitor 套壳 + GitHub Actions 云端编译（无需 Mac）+ 免费 Apple ID 签名侧载**。

- 纯单机：所有游戏资源全部打进 APP，装上即玩，无需联网、无需手动导入素材
- 每 7 天需要用电脑重新签一次名（免费 Apple ID 的限制），APP 数据（存档）会保留

## 工程结构

```
noname-ios-build/
├── .github/workflows/build-ios.yml   # 云编译流程（GitHub Actions）
├── mobile/                           # Capacitor iOS 工程（基于官方 libnoname/apps/mobile）
│   ├── capacitor.config.ts           # appId: com.dzxym.noname；webDir 指向 ../game-dist
│   ├── src/                          # iOS 文件系统适配层（preload + platform/ios）
│   ├── scripts/sync.mjs              # 构建 preload → cap sync ios
│   └── native/ios/                   # Xcode 原生工程（BundledFileSystem 插件 + NonameRouter）
├── patches/
│   ├── patch-index.mjs               # 往 index.html 注入 preload 引导
│   └── patch-game-js.mjs             # 跳过 ServiceWorker 检查（capacitor:// 协议不支持）
├── game-code.tar / game-image.tar / game-audio.tar   # 游戏本体三个分包（上传到 Release）
└── README.md
```

## 使用步骤

### 一、上传工程到 GitHub

1. 注册/登录 [GitHub](https://github.com)，新建一个仓库（建议 **Public**，Actions 免费不限时；Private 每月只有约 200 分钟 macOS 编译额度）
2. 在本目录（noname-ios-build）执行：

```bash
git init
git add .
git commit -m "init: noname ios cloud build"
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git branch -M main
git push -u origin main
```

### 二、上传游戏资源包到 Release

1. 在仓库页面 → Releases → `Create a new release`
2. Choose a tag → 输入 `game-data` → Create new tag on publish
3. 把本目录下三个 tar 包拖进附件区（`game-code.tar`、`game-image.tar`、`game-audio.tar`，共约 2.2GB，上传时间取决于网速）
4. Publish release

### 三、云端编译

1. 仓库 → Actions 标签页 → 左侧 `Build iOS IPA` → `Run workflow` → 运行
2. 等待约 30–60 分钟（下载 2.2GB 资源 + Xcode 编译）
3. 完成后进入该次运行 → Artifacts 下载 `noname-ios-unsigned-ipa`（得到 `noname-unsigned.ipa`）

### 四、签名并安装到 iPhone（Windows 即可）

用 **Sideloadly**（https://sideloadly.io）：

1. 下载安装 Sideloadly（需要 iTunes 或 iCloud for Windows 组件）
2. iPhone 用数据线连电脑，信任电脑
3. Sideloadly 里拖入 `noname-unsigned.ipa`，Apple ID 填你的免费账号
4. 点 Start，输入 Apple ID 密码和双重验证码
5. 手机上：设置 → 通用 → VPN与设备管理 → 找到你的 Apple ID → 信任
6. 桌面出现"无名杀"，开玩

（爱思助手也行：工具箱 → 自签名 → 导入 ipa + 登录 Apple ID → 签名安装）

### 五、7 天续签

免费 Apple ID 签名有效期 7 天。到期前把 iPhone 连上电脑，
重复"步骤四"即可，**游戏存档和下载的扩展都会保留**（重装不影响沙盒数据）。

## 更新游戏内容

改了游戏文件（比如加了新扩展）后：

1. 重新打三个 tar 包（或只改动的那个），删掉 Release 里旧附件，传新的
2. 重新跑一次 Actions → 下载新 ipa → 签名安装

## 常见问题

- **Actions 报错 "release not found"**：先完成步骤二（Release tag 必须是 `game-data`）
- **提示 App ID 数量限制**：免费 Apple ID 每 7 天只能创建 10 个 App ID、同时装 3 个侧载应用；不乱删重签即可
- **首次打开闪退**：确认已在"VPN与设备管理"里信任了开发者证书
- **xcodebuild 报 Xcode 版本错误**：把 workflow 里 `runs-on: macos-26` 换成 `macos-15`（并确认镜像内 Xcode ≥ 26.0）
- **想改 APP 名称/图标**：`mobile/capacitor.config.ts` 改 `appName`；图标替换 `mobile/native/ios/App/App/Assets.xcassets/AppIcon.appiconset/`

## 版权说明

无名杀本体基于 GPL-3.0 开源（https://github.com/libnoname/noname），
本工程仅为个人自用的打包配置，请勿用于商业用途或公开分发。
