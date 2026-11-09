// 给游戏 game/game.js 打 iOS/Capacitor 运行时补丁：
// Capacitor 的 capacitor:// 协议下 WKWebView 不支持 ServiceWorker，
// 旧版游戏启动时的 SW 硬检查（不存在则 alert 并 return）会拦死启动流程。
// 本补丁在 preload 已加载（即处于 Capacitor 客户端）时跳过 SW 检查与注册。
//
// 用法: node patches/patch-game-js.mjs [game-dist目录，默认 ../game-dist]
import { readFileSync, writeFileSync } from "fs";
import { isAbsolute, resolve } from "path";

const arg = process.argv[2] || "../game-dist";
const gameDist = isAbsolute(arg) ? arg : resolve(process.cwd(), arg);
const filePath = resolve(gameDist, "game/game.js");

let code = readFileSync(filePath, "utf8");

if (code.includes("window.__nonameMobilePreload)) {")) {
	console.log("game/game.js 已包含 Capacitor 补丁，跳过");
	process.exit(0);
}

// 1) SW 硬检查放行：Capacitor 环境下不因缺少 serviceWorker 而退出
const anchor1 = 'if (!("serviceWorker" in navigator)) {';
if (!code.includes(anchor1)) throw new Error(`未找到锚点1: ${anchor1}`);
code = code.replace(anchor1, 'if (!("serviceWorker" in navigator) && !window.__nonameMobilePreload) {');

// 2) SW 注册块跳过：Capacitor 环境下不尝试注册
const anchor2 = 'if ("serviceWorker" in navigator) {';
if (!code.includes(anchor2)) throw new Error(`未找到锚点2: ${anchor2}`);
code = code.replace(anchor2, 'if ("serviceWorker" in navigator && !window.__nonameMobilePreload) {');

writeFileSync(filePath, code, "utf8");
console.log(`已为 game/game.js 打上 Capacitor 补丁: ${filePath}`);
