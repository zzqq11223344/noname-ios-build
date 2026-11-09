import { App } from "@capacitor/app";
import { Capacitor, SystemBars } from "@capacitor/core";

import { sanitizeExportName } from "./platform/general";
import { initializeIos, attachIosFileSystem } from "./platform/ios";

/**
 * 无名杀 1.10.17.4（旧版非 monorepo 结构）的 iOS 适配层。
 *
 * 挂载方式：patches/patch-index.mjs 会往游戏 index.html 注入
 * `<script src="noname-preload.js">`，并在 game/importmap.js 之前定义
 * window.initReadWriteFunction；游戏本体 noname/init/index.js 启动时会调用
 * window.initReadWriteFunction(game)，进而执行本 preload。
 */
export default async function preload({ lib, game }: { lib?: any; game: any }) {
	const platform = Capacitor.getPlatform();
	if (platform !== "ios") {
		// 仅在 iOS 客户端内生效，普通浏览器不受影响
		return;
	}

	try {
		lib.path = (await import("path-browserify-esm")).default;
	} catch (e) {
		console.warn("[mobile] lib.path 初始化失败（沿用游戏内置实现）", e);
	}

	await hideSystemBars();
	App.addListener("resume", hideSystemBars).catch(() => {});

	const { fs } = initializeIos();
	const rootCheck = await fs.statEntry({ entryName: "noname.js" });
	if (rootCheck.type !== "file") {
		throw new Error("游戏资源缺失: noname.js");
	}
	attachIosFileSystem(game);

	game.export = function (data: string | Blob, name?: string) {
		const fileName = sanitizeExportName(name);
		const blob = typeof data === "string" ? new Blob([data], { type: "text/plain" }) : data;

		game.writeFile(blob, "export", fileName, (error?: unknown) => {
			if (error) {
				alert(`文件导出失败: ${error instanceof Error ? error.message : String(error)}`);
			} else {
				alert(`文件已导出至游戏目录/export/${fileName}`);
			}
		});
	};

	game.exit = function () {
		// iOS 不允许程序内退出应用；清掉模式信息后重载回主菜单，
		// 否则 reload 会自动进入当前模式。
		if (game.promises && typeof game.promises.saveConfig == "function") {
			game.promises.saveConfig("mode").then(() => game.reload());
		} else {
			location.reload();
		}
	};

	game.open = function (url: string) {
		window.location.href = url;
	};
}

async function hideSystemBars() {
	try {
		await SystemBars.hide();
	} catch {}
}
