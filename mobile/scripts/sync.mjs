// 等价于官方 apps/mobile/scripts/sync.ts 的 iOS 部分：
// 1) 用 vite 把 src/preload.ts 打成 IIFE 格式的 game-dist/noname-preload.js
// 2) 执行 cap sync ios（把 game-dist 拷贝进 Xcode 工程的 public 目录）
import { copyFileSync, mkdirSync, rmSync } from "fs";
import { resolve } from "path";
import { spawnSync } from "child_process";
import { build } from "vite";

const root = resolve(import.meta.dirname, "..");
const gameDistDir = resolve(root, "../game-dist");
const preloadOutDir = resolve(root, ".mobile-preload");

console.log("==> [1/2] 构建 preload (vite IIFE bundle)");
rmSync(preloadOutDir, { recursive: true, force: true });

await build({
	root,
	configFile: false,
	build: {
		outDir: preloadOutDir,
		emptyOutDir: true,
		target: ["safari16.4"],
		sourcemap: false,
		minify: false,
		lib: {
			entry: resolve(root, "src/preload.ts"),
			formats: ["iife"],
			name: "__nonameMobilePreload",
			fileName: () => "noname-preload.js",
		},
		rollupOptions: {
			output: {
				inlineDynamicImports: true,
			},
		},
	},
});

mkdirSync(gameDistDir, { recursive: true });
copyFileSync(resolve(preloadOutDir, "noname-preload.js"), resolve(gameDistDir, "noname-preload.js"));
rmSync(preloadOutDir, { recursive: true, force: true });

console.log("==> [2/2] cap sync ios");
const cliEntry = resolve(root, "node_modules/@capacitor/cli/bin/capacitor");
const result = spawnSync(process.execPath, [cliEntry, "sync", "ios"], {
	cwd: root,
	stdio: "inherit",
});
if (result.status !== 0) {
	throw new Error(`cap sync ios failed with exit code ${result.status ?? "unknown"}`);
}
console.log("sync 完成");
