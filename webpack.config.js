const path = require("node:path");
const webpack = require("webpack");
const pluginConfig = require("./src/config.json");
const process = require("node:process");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");

const FALLBACK_REPOSITORY = "JustOptimize/ShowHiddenChannels";

const isValidRepository = (repository) => {
	const match = /^([^/]+)\/([^/]+)$/.exec(repository?.trim() ?? "");
	if (!match) return false;

	const [, owner, name] = match;
	return (
		owner.length <= 39 &&
		name.length <= 100 &&
		/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner) &&
		/^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,98}[A-Za-z0-9])?$/.test(name)
	);
};

const parseGithubRepository = (remote) => {
	const value = remote?.trim() ?? "";
	let match;

	if (/^https?:\/\//i.test(value) || /^ssh:\/\//i.test(value)) {
		try {
			const url = new URL(value);
			if (url.hostname.toLowerCase() !== "github.com") return;
			match = /^\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/.exec(url.pathname);
		} catch {
			return;
		}
	} else {
		match =
			/^(?:[^@/\s]+@)?github\.com:([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i.exec(
				value,
			);
	}

	if (!match) return;
	const repository = `${match[1]}/${match[2]}`;
	return isValidRepository(repository) ? repository : undefined;
};

const resolveGithubRepository = (env = {}) => {
	const candidates = [];
	if (env.updateRepo) {
		candidates.push(env.updateRepo);
	}
	if (process.env.SHC_GITHUB_REPOSITORY) {
		candidates.push(process.env.SHC_GITHUB_REPOSITORY);
	}
	if (process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_REPOSITORY) {
		candidates.push(process.env.GITHUB_REPOSITORY);
	}

	try {
		candidates.push(
			parseGithubRepository(
				execFileSync("git", ["config", "--get", "remote.origin.url"], {
					cwd: __dirname,
					encoding: "utf8",
					stdio: ["ignore", "pipe", "ignore"],
				}),
			),
		);
	} catch {
		// A source archive or a checkout without an origin can still build.
	}

	for (const candidate of candidates) {
		if (isValidRepository(candidate)) return candidate.trim();
	}

	return FALLBACK_REPOSITORY;
};

const createWebpackConfig = (env = {}) => {
	const githubRepository = resolveGithubRepository(env);
	const sourceUrl = `https://github.com/${githubRepository}/tree/main`;
	const updateUrl = `https://raw.githubusercontent.com/${githubRepository}/main/ShowHiddenChannels.plugin.js`;
	console.info(
		`ℹ️  Resolved GitHub repository ${githubRepository} (source: ${sourceUrl})`,
	);

	const buildConfig = {
		...pluginConfig,
		source: sourceUrl,
		updateUrl,
	};

	const meta = (() => {
		const lines = ["/**"];
		for (const key in buildConfig) {
			if (key === "changelog") continue;

			lines.push(` * @${key} ${buildConfig[key]}`);
		}
		lines.push(" */");
		return lines.join("\n");
	})();

	return {
		mode: "development",
		target: "node",
		devtool: false,
		entry: "./src/index.js",
		output: {
			filename: "ShowHiddenChannels.plugin.js",

			path: path.join(__dirname, "dist"),

			libraryTarget: "commonjs2",
			libraryExport: "default",
			compareBeforeEmit: false,
		},
		resolve: {
			extensions: [".js", ".css", ".jsx"],
		},
		module: {
			rules: [
				{ test: /\.css$/, use: "raw-loader" },
				{ test: /\.jsx$/, exclude: /node_modules/, use: "babel-loader" },
			],
		},
		plugins: [
			new webpack.BannerPlugin({ raw: true, banner: meta }),
			{
				apply: (compiler) => {
					compiler.hooks.assetEmitted.tap(
						"ShowHiddenChannels",
						(filename, info) => {
							console.info(`\n\nℹ️  Plugin built as ${filename}\n`);

							const userConfig = (() => {
								if (process.platform === "win32") return process.env.APPDATA;

								if (process.platform === "darwin") {
									return path.join(
										process.env.HOME,
										"Library",
										"Application Support",
									);
								}

								if (process.env.XDG_CONFIG_HOME) {
									return process.env.XDG_CONFIG_HOME;
								}

								return path.join(process.env.HOME, "Library", ".config");
							})();

							const bdFolder = path.join(userConfig, "BetterDiscord");
							fs.copyFileSync(
								info.targetPath,
								path.join(bdFolder, "plugins", filename),
							);
							console.info("\n\n✅ Copied to BD folder\n");
						},
					);
				},
			},
			new webpack.DefinePlugin({
				__VERSION__: JSON.stringify(pluginConfig.version),
			}),
			new webpack.DefinePlugin({
				__CHANGELOG__: JSON.stringify(pluginConfig.changelog),
			}),
			new webpack.DefinePlugin({
				__GITHUB_REPOSITORY__: JSON.stringify(githubRepository),
			}),
		],
	};
};

module.exports = createWebpackConfig;
