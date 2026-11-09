#!/usr/bin/env bash
# 重新打包游戏资源（更新游戏内容后运行此脚本）
# 产出: game-code.tar / game-image.tar / game-audio.tar
# 注意: 必须用 Git Bash 的 GNU tar（UTF-8 文件名 + 正斜杠路径），
#       Windows 自带 bsdtar 的 zip 会写入 GBK 文件名（macOS 解压乱码），
#       PowerShell .NET 的 zip 会写入反斜杠路径（macOS 解压结构损坏）。
set -e

GAME="/d/Game/PC版无名杀/noname-1.10.17.4.1"
OUT="/d/Game/PC版无名杀/noname-ios-build"

cd "$GAME"

tar -cf "$OUT/game-code.tar" \
  --exclude='./image' \
  --exclude='./audio' \
  --exclude='./露头素材（十周年露头）' \
  --exclude='./卡牌扩充素材【必用】' \
  --exclude='./势力边框扩充【打抗秦必用】' \
  --exclude='./docs' \
  --exclude='./typings' \
  --exclude='./.workbuddy' \
  --exclude='./noname-server.exe' \
  --exclude='./README.docx' \
  --exclude='./README.md' \
  --exclude='./CODE_OF_CONDUCT.md' \
  --exclude='./CONTRIBUTING.md' \
  --exclude='./创建.txt' \
  --exclude='./catalogTemplate.txt' \
  --exclude='./deno.json' \
  --exclude='./tsconfig.json' \
  --exclude='./eslint.config.mjs' \
  --exclude='./generateDocumentation.js' \
  .

tar -cf "$OUT/game-image.tar" ./image
tar -cf "$OUT/game-audio.tar" ./audio

ls -lh "$OUT"/*.tar
echo "打包完成，请上传到 GitHub Release (tag: game-data)"
