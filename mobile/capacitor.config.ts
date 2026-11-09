import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
	appId: "com.dzxym.noname",
	appName: "无名杀",
	// 游戏本体（旧版 1.10.17.4）直接作为静态资源，无需构建
	webDir: "../game-dist",
	ios: {
		path: "native/ios",
		contentInset: "never",
		limitsNavigationsToAppBoundDomains: false,
	},
	plugins: {
		App: {},
		SystemBars: {
			hidden: true,
			style: "DARK",
		},
	},
};

export default config;
