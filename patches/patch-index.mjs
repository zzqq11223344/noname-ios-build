// 往游戏 index.html 的 <script src="game/importmap.js"> 之前注入 iOS preload 引导。
// 动态 patch（而不是放置整份 index.html），这样游戏本体更新后无需同步维护补丁。
//
// 用法: node patches/patch-index.mjs [game-dist目录，默认 ../game-dist]
import { readFileSync, writeFileSync } from "fs";
import { isAbsolute, resolve } from "path";

const arg = process.argv[2] || "../game-dist";
const gameDist = isAbsolute(arg) ? arg : resolve(process.cwd(), arg);
const indexPath = resolve(gameDist, "index.html");

const INJECT = `\t<script src="noname-preload.js"></script>
\t<script>
		"use strict";
		(function () {
			var preload = window.__nonameMobilePreload;
			// IIFE bundle 的全局变量直接就是导出函数；兼容 { default: fn } 两种形式
			if (preload && typeof preload == "object" && typeof preload.default == "function") {
				preload = preload.default;
			}
			if (
				typeof preload == "function" &&
				typeof window.initReadWriteFunction != "function" &&
				!window.require &&
				!window.__dirname
			) {
				window.initReadWriteFunction = function (game) {
					var lib = (typeof window.lib != "undefined" && window.lib) || {};
					return preload({ lib: lib, game: game });
				};
			}
		})();
	</script>
`;

let html = readFileSync(indexPath, "utf8");

if (html.includes("noname-preload.js")) {
	console.log("index.html 已包含 preload 注入，跳过");
	process.exit(0);
}

const anchor = '<script src="game/importmap.js"></script>';
if (!html.includes(anchor)) {
	throw new Error(`未找到注入锚点: ${anchor}`);
}

html = html.replace(anchor, INJECT + anchor);
writeFileSync(indexPath, html, "utf8");
console.log(`已注入 iOS preload 引导: ${indexPath}`);
