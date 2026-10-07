const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const babel = require("@babel/core");
const presetEnv = require("@babel/preset-env");
const presetReact = require("@babel/preset-react");
const { test } = require("node:test");

const sourceRoot = path.resolve(
	process.env.SHC_TEST_SOURCE_ROOT || path.join(__dirname, ".."),
);

function compile(sourcePath, { require: localRequire, globals = {} }) {
	const source = fs.readFileSync(sourcePath, "utf8");
	const { code } = babel.transformSync(source, {
		configFile: false,
		babelrc: false,
		presets: [
			[presetEnv, { targets: { node: "current" } }],
			[presetReact, { pragma: "BdApi.React.createElement" }],
		],
	});
	const module = { exports: {} };
	const execute = new Function(
		"require",
		"module",
		"exports",
		...Object.keys(globals),
		code,
	);
	execute(localRequire, module, module.exports, ...Object.values(globals));
	return module.exports;
}

function createEnvironment({ renderer = () => ({ render() {} }) } = {}) {
	const logs = [];
	const console = Object.fromEntries(
		["log", "warn", "error"].map((method) => [
			method,
			(...args) => logs.push({ method, args }),
		]),
	);
	let containerAvailable = true;
	const dispatcher = {
		_actionHandlers: {
			_nodes: new Map([
				["permission-token", { actionHandler() {} }],
				["channel-token", { actionHandler() {} }],
			]),
		},
	};
	const stores = Object.fromEntries(
		[
			"UserStore",
			"ChannelStore",
			"GuildStore",
			"GuildRoleStore",
			"GuildChannelStore",
			"PermissionStore",
			"ChannelListStore",
			"ReadStateStore",
		].map((name) => [
			name,
			{
				_dispatchToken: `${name === "PermissionStore" ? "permission" : "channel"}-token`,
				_dispatcher: dispatcher,
			},
		]),
	);
	const byKeys = {
		"getUserAvatarURL,getGuildIconURL": {
			getUserAvatarURL() {},
			getGuildIconURL() {},
		},
		getMember: { getMember() {}, isMember() {} },
		setLocale: { setLocale() {} },
		"chat,chatContent": { chat: "chat" },
		getChannelPermissions: { can() {} },
		"dispatch,subscribe": dispatcher,
		"container,hubContainer": () =>
			containerAvailable ? { container: "container" } : undefined,
		createChannelRecord: {
			createChannelRecord(value) {
				return value;
			},
		},
		DEFAULT_AVATARS: {
			DEFAULT_AVATARS: ["https://example.invalid/avatar.png"],
		},
		iconItem: { iconItem: "icon", actionIcon: "action" },
		getVoiceStateStats: { getChannelId() {} },
		handleUserContextMenu: { react() {} },
		"isCollapsed,getCollapsedCategories": { isCollapsed() {} },
	};
	const webpack = {
		Filters: { byStrings: (...needles) => ({ needles }) },
		getModule: (filter) => {
			const candidates = [{ ADD_REACTIONS: 1 }, { GUILD_VOICE: 2 }];
			return candidates.find(filter);
		},
		getByKeys: (...keys) => {
			const value = byKeys[keys.join(",")];
			return typeof value === "function" ? value() : value;
		},
		getStore: (name) => stores[name],
		getMangled: (name) => {
			switch (name) {
				case "transitionTo - Transitioning to ":
					return { transitionTo() {} };
				case 'location:"channel_item"':
					return renderer();
				case "overflow-more-roles-":
					return { RolePill() {} };
				case "setFlag: user cannot be undefined":
					return { fetchProfile() {} };
				case ".computeLurkerPermissionsAllowList()":
					return { can() {} };
				default:
					return {};
			}
		},
		getBySource: () => ({ route: true }),
	};
	const BdApi = {
		Webpack: webpack,
		React: { createElement() {}, memo() {}, useState() {}, useEffect() {} },
		ReactDOM: { render() {} },
		ReactUtils: { getInternalInstance() {}, getOwnerInstance() {} },
		DOM: { addStyle() {}, removeStyle() {} },
		ContextMenu: { patch() {}, unpatch() {}, buildItem() {} },
		Utils: { findInTree() {} },
		Components: { Tooltip() {}, Text() {} },
	};
	const dispatcherPath = path.join(sourceRoot, "src/utils/dispatcher.js");
	const dispatcherExports = compile(dispatcherPath, {
		require: require.bind(module),
	});
	const modulesPath = path.join(sourceRoot, "src/utils/modules.js");
	const moduleExports = compile(modulesPath, {
		require: (specifier) => {
			if (specifier === "./dispatcher") return dispatcherExports;
			throw new Error(`Unexpected modules.js dependency: ${specifier}`);
		},
		globals: { BdApi, console },
	});
	return {
		BdApi,
		logs,
		moduleExports,
		setContainerAvailable(value) {
			containerAvailable = value;
		},
		setRenderer(value) {
			renderer = () => value;
		},
	};
}

function loadPlugin(environment, { now = () => 0, timers = {} } = {}) {
	const NativeDate = Date;
	class TestDate extends NativeDate {
		static now() {
			return now();
		}
	}
	const pluginPath = path.join(sourceRoot, "src/index.js");
	const pluginExports = compile(pluginPath, {
		require: (specifier) => {
			if (specifier === "./styles.css") return {};
			if (specifier === "./utils/channelIcons")
				return { installLockedChannelIcons() {} };
			if (specifier === "./utils/dispatcher")
				return {
					getDispatcherNodes() {
						return [];
					},
				};
			if (specifier === "./utils/modules") return environment.moduleExports;
			throw new Error(`Unexpected index.js dependency: ${specifier}`);
		},
		globals: {
			BdApi: class {
				static Webpack = environment.BdApi.Webpack;

				constructor() {
					this.Data = { load: () => ({ checkForUpdates: false }) };
					this.UI = {
						showConfirmationModal: (...args) => {
							if (!environment.modals) environment.modals = [];
							environment.modals.push(args);
						},
					};
					this.Plugins = { disable() {} };
				}
			},
			console: {
				...console,
				warn: (...args) => environment.logs.push({ method: "warn", args }),
			},
			Date: TestDate,
			setInterval: timers.setInterval ?? global.setInterval,
			clearInterval: timers.clearInterval ?? global.clearInterval,
			__VERSION__: "test",
			__GITHUB_REPOSITORY__: "JustOptimize/ShowHiddenChannels",
			__CHANGELOG__: [],
		},
	});
	const Plugin = pluginExports.default;
	const plugin = new Plugin({ name: "ShowHiddenChannels" });
	plugin.doStart = () => {
		environment.didStart = true;
	};
	return plugin;
}

test("module validation accepts a renderer with a render function", () => {
	const environment = createEnvironment();
	const modules = environment.moduleExports.getModules();

	assert.equal(typeof modules.ChannelItemRenderer.render, "function");
	assert.equal(environment.moduleExports.loaded_successfully, true);
	assert.ok(
		environment.logs.some(({ args }) => args.includes("All variables found.")),
	);
});

for (const [description, renderer] of [
	["missing renderer export", {}],
	["undefined renderer method", { render: undefined }],
	["non-function renderer method", { render: "not a function" }],
]) {
	test(`module validation rejects ${description}`, () => {
		const environment = createEnvironment({ renderer: () => renderer });
		environment.moduleExports.getModules();

		assert.equal(environment.moduleExports.loaded_successfully, false);
		assert.ok(
			environment.logs.some(({ args }) =>
				args.some(
					(value) =>
						typeof value === "string" && value.includes("ChannelItemRenderer"),
				),
			),
			"expected a ChannelItemRenderer validation error",
		);
	});
}

test("unloading modules allows a failed renderer lookup to recover", () => {
	const environment = createEnvironment({ renderer: () => ({}) });
	environment.moduleExports.getModules();
	assert.equal(environment.moduleExports.loaded_successfully, false);

	environment.setRenderer({ render() {} });
	environment.moduleExports.UnloadModules();
	environment.moduleExports.getModules();

	assert.equal(environment.moduleExports.loaded_successfully, true);
	assert.equal(
		typeof environment.moduleExports.getModules().ChannelItemRenderer.render,
		"function",
	);
});

test("startup timeout logs and reaches the broken-module gate", async () => {
	let timestamp = 0;
	let callback;
	let cleared = false;
	const environment = createEnvironment({ renderer: () => ({}) });
	environment.setContainerAvailable(false);
	const plugin = loadPlugin(environment, {
		now: () => timestamp,
		timers: {
			setInterval(fn) {
				callback = fn;
				return 7;
			},
			clearInterval(id) {
				assert.equal(id, 7);
				cleared = true;
			},
		},
	});
	let settled = false;
	const starting = plugin.start().finally(() => {
		settled = true;
	});
	await Promise.resolve();
	timestamp = 10000;
	assert.doesNotThrow(callback);
	await starting;

	assert.equal(cleared, true);
	assert.equal(settled, true);
	assert.ok(
		environment.logs.some(
			({ method, args }) =>
				method === "error" &&
				args.some(
					(value) =>
						typeof value === "string" &&
						value.includes("Timed out waiting for container"),
				),
		),
		"expected the timeout to be logged",
	);
	assert.ok(environment.modals?.[0]?.[0].includes("Broken Modules"));
});

test("startup proceeds when the container becomes ready", async () => {
	let callback;
	const environment = createEnvironment();
	const plugin = loadPlugin(environment, {
		timers: {
			setInterval(fn) {
				callback = fn;
				return 8;
			},
			clearInterval() {},
		},
	});
	const starting = plugin.start();
	await Promise.resolve();
	assert.doesNotThrow(callback);
	await starting;

	assert.equal(environment.didStart, true);
	assert.equal(
		environment.logs.some(({ args }) =>
			args.some(
				(value) =>
					typeof value === "string" &&
					value.includes("Timed out waiting for container"),
			),
		),
		false,
	);
});
