/**
 * @name ShowHiddenChannels
 * @displayName Show Hidden Channels (SHC)
 * @version 6.14
 * @author JustOptimize (Oggetto), XxUnkn0wnxX (AI)
 * @authorId 619203349954166804
 * @source https://github.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/tree/main
 * @updateUrl https://raw.githubusercontent.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/main/ShowHiddenChannels.plugin.js
 * @invite q4gW3j5FUY
 * @description A plugin which displays all hidden Channels and allows users to view information about them, this won't allow you to read them (impossible).
 * @runAt idle
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/components/AdminRolesComponent.jsx"
/*!************************************************!*\
  !*** ./src/components/AdminRolesComponent.jsx ***!
  \************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/modules */ "./src/utils/modules.js");
// @ts-check


const {
  Components: {
    TextElement
  },
  RolePill,
  DiscordConstants,
  React
} = (0,_utils_modules__WEBPACK_IMPORTED_MODULE_0__.getModules)();
const AdminRolesElement = ({
  guild,
  settings,
  roles
}) => {
  if (!settings.showAdmin) return null;
  if (settings.showAdmin === "channel") return null;
  const adminRoles = [];
  for (const role of Object.values(roles)) {
    if ((role.permissions & BigInt(8)) === BigInt(8) && (settings.showAdmin === "include" || settings.showAdmin === "exclude" && !role.tags?.bot_id)) {
      adminRoles.push(role);
    }
  }
  if (!adminRoles?.length) {
    return null;
  }
  return BdApi.React.createElement(TextElement, {
    color: TextElement.Colors.STANDARD,
    style: {
      borderTop: "1px solid var(--border-subtle)",
      padding: 5
    }
  }, "Admin roles:", BdApi.React.createElement("div", {
    style: {
      paddingTop: 5
    }
  }, adminRoles.map(m => BdApi.React.createElement(RolePill, {
    key: m.id,
    canRemove: false,
    className: "shc-rolePill",
    disableBorderColor: true,
    guildId: guild.id,
    onRemove: DiscordConstants.NOOP,
    role: m
  }))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (React.memo(AdminRolesElement));

/***/ },

/***/ "./src/components/ChannelRolesComponent.jsx"
/*!**************************************************!*\
  !*** ./src/components/ChannelRolesComponent.jsx ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ChannelRolesComponent)
/* harmony export */ });
/* harmony import */ var _utils_modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/modules */ "./src/utils/modules.js");
// @ts-check


const {
  Components: {
    TextElement
  },
  RolePill,
  DiscordConstants
} = (0,_utils_modules__WEBPACK_IMPORTED_MODULE_0__.getModules)();
function ChannelRolesComponent({
  channel,
  guild,
  settings,
  roles
}) {
  const channelRoles = Object.values(channel.permissionOverwrites).filter(role => role !== undefined && role?.type === 0 && (
  //* 1024n = VIEW_CHANNEL permission
  //* 8n = ADMINISTRATOR permission
  //* If role is ADMINISTRATOR it can view channel even if overwrites deny VIEW_CHANNEL
  settings.showAdmin && (roles[role.id].permissions & BigInt(8)) === BigInt(8) ||
  //* If overwrites allow VIEW_CHANNEL (it will override the default role permissions)
  (role.allow & BigInt(1024)) === BigInt(1024) ||
  //* If role can view channel by default and overwrites don't deny VIEW_CHANNEL
  roles[role.id].permissions & BigInt(1024) && (role.deny & BigInt(1024)) === BigInt(0)));
  return BdApi.React.createElement(TextElement, {
    color: TextElement.Colors.STANDARD,
    style: {
      borderTop: "1px solid var(--border-subtle)",
      padding: 8
    }
  }, "Channel-specific roles:", BdApi.React.createElement("div", {
    style: {
      paddingTop: 8
    }
  }, !channelRoles?.length && BdApi.React.createElement("span", null, "None"), channelRoles?.length > 0 && channelRoles.map(m => BdApi.React.createElement(RolePill, {
    key: m.id,
    canRemove: false,
    className: "shc-rolePill",
    disableBorderColor: true,
    guildId: guild.id,
    onRemove: DiscordConstants.NOOP,
    role: roles[m.id]
  }))));
}

/***/ },

/***/ "./src/components/ForumComponent.jsx"
/*!*******************************************!*\
  !*** ./src/components/ForumComponent.jsx ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ForumComponent)
/* harmony export */ });
/* harmony import */ var _utils_modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/modules */ "./src/utils/modules.js");
// @ts-check

const {
  Components: {
    TextElement
  }
} = (0,_utils_modules__WEBPACK_IMPORTED_MODULE_0__.getModules)();
function ForumComponent({
  channel
}) {
  if (channel.type !== 15) return null;
  if (!channel.availableTags && !channel.topic) {
    return null;
  }
  return BdApi.React.createElement(TextElement, {
    color: TextElement.Colors.HEADER_SECONDARY,
    size: TextElement.Sizes.SIZE_24,
    style: {
      margin: "16px auto",
      backgroundColor: "var(--bg-surface-raised)",
      padding: 24,
      borderRadius: 8,
      fontWeight: "bold",
      maxWidth: "40vw"
    }
  }, "Forum", BdApi.React.createElement(TextElement, {
    color: TextElement.Colors.STANDARD,
    size: TextElement.Sizes.SIZE_14,
    style: {
      marginTop: 24
    }
  }, channel.availableTags && channel.availableTags.length > 0 ? `Tags: ${channel.availableTags.map(tag => tag.name).join(", ")}` : "Tags: No tags avaiable"), channel.topic && BdApi.React.createElement(TextElement, {
    color: TextElement.Colors.STANDARD,
    size: TextElement.Sizes.SIZE_14,
    style: {
      marginTop: 16
    }
  }, "Guidelines: ", channel.topic), !channel.topic && BdApi.React.createElement(TextElement, {
    color: TextElement.Colors.STANDARD,
    size: TextElement.Sizes.SIZE_14,
    style: {
      marginTop: 8
    }
  }, "Guidelines: No guidelines avaiable"));
}

/***/ },

/***/ "./src/components/HiddenChannelIcon.jsx"
/*!**********************************************!*\
  !*** ./src/components/HiddenChannelIcon.jsx ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HiddenChannelIcon: () => (/* binding */ HiddenChannelIcon)
/* harmony export */ });
/* harmony import */ var _utils_modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/modules */ "./src/utils/modules.js");
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// @ts-check

;
const {
  React,
  Components: {
    Tooltip
  }
} = (0,_utils_modules__WEBPACK_IMPORTED_MODULE_0__.getModules)();
function HiddenChannelComponent({
  icon,
  iconItem,
  actionIcon
}) {
  return BdApi.React.createElement(Tooltip, {
    text: "Hidden Channel"
  }, props => BdApi.React.createElement("div", _extends({
    className: iconItem,
    style: {
      display: "block"
    }
  }, props), icon === "lock" && BdApi.React.createElement("svg", {
    className: actionIcon,
    viewBox: "0 0 24 24"
  }, BdApi.React.createElement("title", null, "SHC Lock icon"), BdApi.React.createElement("path", {
    fill: "currentColor",
    d: "M17 11V7C17 4.243 14.756 2 12 2C9.242 2 7 4.243 7 7V11C5.897 11 5 11.896 5 13V20C5 21.103 5.897 22 7 22H17C18.103 22 19 21.103 19 20V13C19 11.896 18.103 11 17 11ZM12 18C11.172 18 10.5 17.328 10.5 16.5C10.5 15.672 11.172 15 12 15C12.828 15 13.5 15.672 13.5 16.5C13.5 17.328 12.828 18 12 18ZM15 11H9V7C9 5.346 10.346 4 12 4C13.654 4 15 5.346 15 7V11Z"
  })), icon === "eye" && BdApi.React.createElement("svg", {
    className: actionIcon,
    viewBox: "0 0 24 24"
  }, BdApi.React.createElement("title", null, "SHC Eye icon"), BdApi.React.createElement("path", {
    fill: "currentColor",
    d: "M12 5C5.648 5 1 12 1 12C1 12 5.648 19 12 19C18.352 19 23 12 23 12C23 12 18.352 5 12 5ZM12 16C9.791 16 8 14.21 8 12C8 9.79 9.791 8 12 8C14.209 8 16 9.79 16 12C16 14.21 14.209 16 12 16Z"
  }), BdApi.React.createElement("path", {
    fill: "currentColor",
    d: "M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
  }), BdApi.React.createElement("polygon", {
    fill: "currentColor",
    points: "22.6,2.7 22.6,2.8 19.3,6.1 16,9.3 16,9.4 15,10.4 15,10.4 10.3,15 2.8,22.5 1.4,21.1 21.2,1.3 "
  }))));
}
const HiddenChannelIcon = React.memo(HiddenChannelComponent);

/***/ },

/***/ "./src/components/IconSwitchWrapper.jsx"
/*!**********************************************!*\
  !*** ./src/components/IconSwitchWrapper.jsx ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   IconSwitchWrapper: () => (/* binding */ IconSwitchWrapper)
/* harmony export */ });
// @ts-check

const {
  React
} = BdApi;
function IconSwitchWrapper({
  icon,
  value,
  onChange,
  children,
  note
}) {
  const [enabled, setEnabled] = React.useState(value);
  return BdApi.React.createElement("div", null, BdApi.React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      marginBottom: "16px",
      marginTop: "16px"
    }
  }, BdApi.React.createElement("img", {
    alt: "Icon",
    src: icon,
    width: 48,
    height: 48,
    title: "Click to toggle",
    style: {
      borderRadius: "360px",
      cursor: "pointer",
      border: enabled ? "3px solid green" : "3px solid grey",
      marginRight: "8px"
    },
    onClick: () => {
      onChange(!enabled);
      setEnabled(!enabled);
    },
    onKeyDown: e => {
      if (e.key === "Enter" || e.key === " ") {
        onChange(!enabled);
        setEnabled(!enabled);
      }
    }
  }), BdApi.React.createElement("div", {
    style: {
      maxWidth: "89%"
    }
  }, BdApi.React.createElement("div", {
    style: {
      fontSize: "20px",
      color: "var(--header-primary)",
      fontWeight: "600"
    }
  }, children), BdApi.React.createElement("div", {
    style: {
      color: "var(--header-secondary)",
      fontSize: "16px"
    }
  }, note))));
}

/***/ },

/***/ "./src/components/Lockscreen.jsx"
/*!***************************************!*\
  !*** ./src/components/Lockscreen.jsx ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Lockscreen: () => (/* binding */ Lockscreen)
/* harmony export */ });
/* harmony import */ var _utils_date__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/date */ "./src/utils/date.js");
/* harmony import */ var _utils_modules__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/modules */ "./src/utils/modules.js");
/* harmony import */ var _AdminRolesComponent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AdminRolesComponent */ "./src/components/AdminRolesComponent.jsx");
/* harmony import */ var _ChannelRolesComponent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ChannelRolesComponent */ "./src/components/ChannelRolesComponent.jsx");
/* harmony import */ var _ForumComponent__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ForumComponent */ "./src/components/ForumComponent.jsx");
/* harmony import */ var _UserMentionsComponent__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./UserMentionsComponent */ "./src/components/UserMentionsComponent.jsx");
// @ts-check







const {
  Components: {
    TextElement
  },
  GuildStore,
  GuildRoleStore,
  React
} = (0,_utils_modules__WEBPACK_IMPORTED_MODULE_1__.getModules)();
const CHANNEL_TYPES = {
  0: "text",
  2: "voice",
  4: "category",
  5: "news",
  6: "store",
  13: "stage",
  15: "forum",
  16: "media"
};
const Lockscreen = React.memo((/** @type {{ chat: string, channel: import('../discord').SHCChannel, settings: Record<string, any>, isLockedVoiceChannel?: boolean, showTopic?: boolean }} */{
  chat,
  channel,
  settings,
  isLockedVoiceChannel = false,
  showTopic = true
}) => {
  const guild = GuildStore.getGuild(channel.guild_id);
  const guildRoles = GuildRoleStore.getRolesSnapshot(guild?.id);
  const topic = showTopic && ![15, 16].includes(channel.type) ? channel.topic : null;
  return BdApi.React.createElement("div", {
    className: ["shc-hidden-chat-content", chat].filter(Boolean).join(" "),
    style: {
      justifyContent: "center",
      alignItems: "center"
    }
  }, BdApi.React.createElement("div", {
    className: "shc-hidden-notice"
  }, BdApi.React.createElement("img", {
    alt: "Hidden Channel Icon",
    style: {
      // @ts-expect-error webkitUserDrag is not recognized by TypeScript but is valid in CSS
      webkitUserDrag: "none",
      maxHeight: 128,
      margin: "0 auto"
    },
    src: settings.hiddenChannelIcon === "eye" ? "https://raw.githubusercontent.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/main/assets/eye.png" : "/assets/755d4654e19c105c3cd108610b78d01c.svg"
  }), BdApi.React.createElement(TextElement, {
    color: TextElement.Colors.HEADER_PRIMARY,
    size: TextElement.Sizes.SIZE_32,
    style: {
      marginTop: 20,
      fontWeight: "bold"
    }
  }, `This is a ${isLockedVoiceChannel ? "locked" : "hidden"}${CHANNEL_TYPES[channel.type] ? ` ${CHANNEL_TYPES[channel.type]}` : ""} channel`), BdApi.React.createElement(TextElement, {
    color: TextElement.Colors.HEADER_SECONDARY,
    size: TextElement.Sizes.SIZE_16,
    style: {
      marginTop: 8
    }
  }, isLockedVoiceChannel ? "You cannot connect to this channel." : "You cannot see the contents of this channel."), topic && BdApi.React.createElement(TextElement, {
    color: TextElement.Colors.STANDARD,
    size: TextElement.Sizes.SIZE_14,
    style: {
      marginTop: 16,
      whiteSpace: "pre-wrap",
      overflowWrap: "anywhere"
    }
  }, topic), channel?.iconEmoji && BdApi.React.createElement(TextElement, {
    color: TextElement.Colors.STANDARD,
    size: TextElement.Sizes.SIZE_14,
    style: {
      marginTop: 16
    }
  }, "Icon emoji: ", channel.iconEmoji.name ?? channel.iconEmoji.id), channel.rateLimitPerUser > 0 && BdApi.React.createElement(TextElement, {
    color: TextElement.Colors.STANDARD,
    size: TextElement.Sizes.SIZE_14
  }, "Slowmode: ", (0,_utils_date__WEBPACK_IMPORTED_MODULE_0__.convertToHMS)(Number(channel.rateLimitPerUser))), channel.nsfw && BdApi.React.createElement(TextElement, {
    color: TextElement.Colors.STANDARD,
    size: TextElement.Sizes.SIZE_14
  }, "Age-Restricted Channel (NSFW) \uD83D\uDD1E"), channel.isSpoilerChannel?.() && BdApi.React.createElement(TextElement, {
    color: TextElement.Colors.STANDARD,
    size: TextElement.Sizes.SIZE_14
  }, "Spoiler Channel \uD83D\uDC41\uFE0F"), channel.bitrate && channel.type === 2 && BdApi.React.createElement(TextElement, {
    color: TextElement.Colors.STANDARD,
    size: TextElement.Sizes.SIZE_14
  }, "Bitrate: ", channel.bitrate / 1000, "kbps"), BdApi.React.createElement(TextElement, {
    color: TextElement.Colors.STANDARD,
    size: TextElement.Sizes.SIZE_14,
    style: {
      marginTop: 8
    }
  }, "Created on: ", (0,_utils_date__WEBPACK_IMPORTED_MODULE_0__.getDateFromSnowflake)(channel.id)), channel.lastMessageId && BdApi.React.createElement(TextElement, {
    color: TextElement.Colors.STANDARD,
    size: TextElement.Sizes.SIZE_14
  }, "Last message sent: ", (0,_utils_date__WEBPACK_IMPORTED_MODULE_0__.getDateFromSnowflake)(channel.lastMessageId)), settings.showPerms && channel.permissionOverwrites && BdApi.React.createElement("div", {
    style: {
      margin: "16px auto 0 auto",
      backgroundColor: "var(--bg-surface-raised)",
      padding: 10,
      borderRadius: 5,
      color: "var(--text-default)"
    }
  }, BdApi.React.createElement(_UserMentionsComponent__WEBPACK_IMPORTED_MODULE_5__["default"], {
    channel: channel,
    guild: guild,
    settings: settings
  }), BdApi.React.createElement(_ChannelRolesComponent__WEBPACK_IMPORTED_MODULE_3__["default"], {
    channel: channel,
    guild: guild,
    settings: settings,
    roles: guildRoles
  }), BdApi.React.createElement(_AdminRolesComponent__WEBPACK_IMPORTED_MODULE_2__["default"], {
    guild: guild,
    settings: settings,
    roles: guildRoles
  })), BdApi.React.createElement(_ForumComponent__WEBPACK_IMPORTED_MODULE_4__["default"], {
    channel: channel
  })));
});

/***/ },

/***/ "./src/components/SettingsPanel.jsx"
/*!******************************************!*\
  !*** ./src/components/SettingsPanel.jsx ***!
  \******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SettingsPanel: () => (/* binding */ SettingsPanel)
/* harmony export */ });
/* harmony import */ var _utils_modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/modules */ "./src/utils/modules.js");
// @ts-check

const {
  Logger,
  DiscordConstants,
  GuildStore,
  ImageResolver,
  DEFAULT_AVATARS
} = (0,_utils_modules__WEBPACK_IMPORTED_MODULE_0__.getModules)();
const {
  Components: {
    RadioInput,
    SettingGroup,
    SwitchInput: SwitchItem,
    SettingItem
  }
} = BdApi;
const {
  React
} = BdApi;

// If type starts with GUILD, it's a guild channel
const ChannelTypes = Object.keys(DiscordConstants?.ChannelTypes ?? {}).filter(type => type.startsWith("GUILD") && type !== "GUILD_CATEGORY");
const {
  IconSwitchWrapper
} = __webpack_require__(/*! ./IconSwitchWrapper */ "./src/components/IconSwitchWrapper.jsx");
const Switch = ({
  value,
  onChange,
  name,
  note = ""
}) => {
  return BdApi.React.createElement(BdApi.React.Fragment, null, BdApi.React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      marginTop: "20px"
    },
    className: "bd-setting-item"
  }, BdApi.React.createElement(SwitchItem, {
    id: `switch-${name}`,
    value: value,
    onChange: i => {
      onChange(i);
    }
  }), BdApi.React.createElement("div", {
    className: "bd-setting-header",
    style: {
      alignItems: "center",
      display: "block",
      marginLeft: "10px"
    }
  }, BdApi.React.createElement("label", {
    className: "bd-setting-title",
    htmlFor: `switch-${name}`
  }, name), note !== "" && BdApi.React.createElement("div", {
    className: "bd-setting-note",
    style: {
      marginBottom: 0
    }
  }, note))), BdApi.React.createElement("hr", {
    className: "bd-divider bd-setting-divider"
  }));
};
const capitalizeFirst = string => `${string.charAt(0).toUpperCase()}${string.substring(1).toLowerCase()}`;
const randomNo = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const SettingsPanel = ({
  settings: initialSettings,
  onSettingsChange
}) => {
  const [settings, setSettings] = React.useState(initialSettings);
  const settingsRef = React.useRef(initialSettings);
  const updateSetting = (name, valueOrUpdater) => {
    const currentValue = settingsRef.current[name];
    const value = typeof valueOrUpdater === "function" ? valueOrUpdater(currentValue) : valueOrUpdater;
    const nextSettings = {
      ...settingsRef.current,
      [name]: value
    };
    settingsRef.current = nextSettings;
    setSettings(nextSettings);
    onSettingsChange(name, value);
  };
  return BdApi.React.createElement("div", null, BdApi.React.createElement(SettingGroup, {
    settings: settings,
    name: "General Settings",
    shown: false,
    id: "general-settings",
    collapsible: true
  }, BdApi.React.createElement(SettingItem, {
    id: "hiddenChannelIcon",
    name: "Hidden Channel Icon",
    note: "What icon to show as an indicator for hidden channels."
  }, BdApi.React.createElement(RadioInput, {
    name: "Hidden Channel Icon",
    options: [{
      name: "Lock Icon",
      value: "lock"
    }, {
      name: "Eye Icon",
      value: "eye"
    }, {
      name: "None",
      value: "false"
    }],
    value: settings.hiddenChannelIcon,
    onChange: value => {
      updateSetting("hiddenChannelIcon", value);
    }
  })), BdApi.React.createElement(SettingItem, {
    id: "sortingOrder",
    name: "Sorting Order",
    note: "Where to display Hidden Channels."
  }, BdApi.React.createElement(RadioInput, {
    name: "Sorting Order",
    options: [{
      name: "Hidden Channels in the native Discord order (default)",
      value: "native"
    }, {
      name: "Hidden Channels at the bottom of the Category",
      value: "bottom"
    }, {
      name: "Hidden Channels in a separate Category at the bottom",
      value: "extra"
    }],
    value: settings.sort,
    onChange: value => {
      updateSetting("sort", value);
    }
  })), BdApi.React.createElement(Switch, {
    value: settings.showPerms,
    onChange: i => {
      updateSetting("showPerms", i);
    },
    name: "Show Permissions",
    note: "Show what roles/users can access the hidden channel."
  }), BdApi.React.createElement(SettingItem, {
    id: "showAdmin",
    name: "Show Admin Roles",
    note: "Show roles that have ADMINISTRATOR permission in the hidden channel page (requires 'Shows Permission' enabled)."
  }, BdApi.React.createElement(RadioInput, {
    name: "Show Admin Roles",
    options: [{
      name: "Show only channel-specific roles",
      value: "channel"
    }, {
      name: "Include Bot Roles",
      value: "include"
    }, {
      name: "Exclude Bot Roles",
      value: "exclude"
    }, {
      name: "Don't Show Administrator Roles",
      value: "false"
    }],
    value: settings.showAdmin,
    onChange: value => {
      updateSetting("showAdmin", value);
    }
  })), BdApi.React.createElement(Switch, {
    value: settings.stopMarkingUnread,
    onChange: i => {
      updateSetting("stopMarkingUnread", i);
    },
    name: "Stop marking hidden channels as read",
    note: "Stops the plugin from marking hidden channels as read."
  }), BdApi.React.createElement(Switch, {
    value: settings.shouldShowEmptyCategory,
    onChange: i => {
      updateSetting("shouldShowEmptyCategory", i);
    },
    name: "Show Empty Category",
    note: "Show Empty Category either because there were no channels in it or all channels are under the hidden channels category."
  })), BdApi.React.createElement(SettingGroup, {
    settings: settings,
    name: "Channel Type Settings",
    shown: false,
    id: "channel-type-settings",
    collapsible: true
  }, Object.values(ChannelTypes).map(type => {
    // GUILD_STAGE_VOICE => [GUILD, STAGE, VOICE]
    const formattedTypes = type.split("_");

    // [GUILD, STAGE, VOICE] => [STAGE, VOICE]
    formattedTypes.shift();

    // [STAGE, VOICE] => Stage Voice
    const formattedType = formattedTypes.map(word => capitalizeFirst(word)).join(" ");
    return BdApi.React.createElement(Switch, {
      key: type,
      value: settings.channels[type],
      onChange: i => {
        updateSetting("channels", channels => ({
          ...channels,
          [type]: i
        }));
      },
      name: `Show ${formattedType} Channels`
    });
  })), BdApi.React.createElement(SettingGroup, {
    settings: settings,
    name: "Guilds Blacklist",
    shown: false,
    id: "guilds-blacklist",
    collapsible: true
  }, Object.values(GuildStore.getGuilds()).map(guild => BdApi.React.createElement(IconSwitchWrapper, {
    key: guild.id,
    note: guild.description,
    value: settings.blacklistedGuilds?.[guild.id] ?? false,
    onChange: e => {
      updateSetting("blacklistedGuilds", blacklistedGuilds => ({
        ...blacklistedGuilds,
        [guild.id]: e
      }));
    },
    icon: ImageResolver.getGuildIconURL(guild) ?? DEFAULT_AVATARS[randomNo(0, DEFAULT_AVATARS.length - 1)]
  }, guild.name))), BdApi.React.createElement(SettingGroup, {
    collapsible: true,
    settings: settings,
    name: "Advanced Settings",
    shown: false,
    id: "advanced-settings"
  }, BdApi.React.createElement(Switch, {
    value: settings.checkForUpdates,
    onChange: i => {
      updateSetting("checkForUpdates", i);
    },
    name: "Check for Updates",
    note: "Check for updates on startup."
  }), BdApi.React.createElement(Switch, {
    value: settings.debugMode,
    onChange: i => {
      Logger.isDebugging = true;
      Logger.debug(`Debug mode ${i ? "enabled" : "disabled"}`);
      Logger.isDebugging = i;
      updateSetting("debugMode", i);
    },
    name: "Debug Mode",
    note: "Enable Debug Mode."
  })));
};

/***/ },

/***/ "./src/components/UserMentionsComponent.jsx"
/*!**************************************************!*\
  !*** ./src/components/UserMentionsComponent.jsx ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ UserMentionsComponent)
/* harmony export */ });
/* harmony import */ var _utils_modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/modules */ "./src/utils/modules.js");
// @ts-check


const {
  React,
  UserMentions,
  ProfileActions,
  GuildMemberStore,
  UserStore,
  DiscordConstants,
  PermissionUtils,
  Components: {
    TextElement
  }
} = (0,_utils_modules__WEBPACK_IMPORTED_MODULE_0__.getModules)();
function UserMentionsComponent({
  channel,
  guild,
  settings
}) {
  const [userMentionComponents, setUserMentionComponents] = React.useState(["Loading..."]);
  const fetchMemberAndMap = async () => {
    setUserMentionComponents(["Loading..."]);
    if (!settings.showPerms) {
      return setUserMentionComponents(["None"]);
    }
    const allUserOverwrites = Object.values(channel.permissionOverwrites).filter(user => Boolean(user && user?.type === 1));
    for (const user of allUserOverwrites) {
      if (UserStore.getUser(user.id)) continue;
      await ProfileActions.fetchProfile(user.id, {
        guildId: guild.id,
        withMutualGuilds: false
      });
      if (allUserOverwrites.indexOf(user) !== allUserOverwrites.length - 1) {
        // Wait between 500ms and 2000ms
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1500) + 500));
      }
    }
    const filteredUserOverwrites = Object.values(channel.permissionOverwrites).filter(user => Boolean(PermissionUtils.can({
      permission: DiscordConstants.Permissions.VIEW_CHANNEL,
      user: UserStore.getUser(user.id),
      context: channel
    }) && GuildMemberStore.isMember(guild.id, user.id)));
    if (!filteredUserOverwrites?.length) {
      return setUserMentionComponents(["None"]);
    }
    const mentionArray = filteredUserOverwrites.map(m => UserMentions.react({
      userId: m.id,
      channelId: channel.id
    }, () => null, {
      noStyleAndInteraction: false
    }));
    return setUserMentionComponents(mentionArray);
  };
  React.useEffect(() => {
    fetchMemberAndMap();
  }, [channel.id, guild.id, settings.showPerms, channel.permissionOverwrites]);
  return BdApi.React.createElement(TextElement, {
    color: TextElement.Colors.STANDARD,
    size: TextElement.Sizes.SIZE_14
  }, "Users that can see this channel:", BdApi.React.createElement("div", {
    style: {
      marginTop: 8,
      marginBottom: 8,
      display: "flex",
      flexDirection: "column",
      flexWrap: "wrap",
      gap: 8,
      padding: 8,
      paddingTop: 0
    }
  }, userMentionComponents));
}

/***/ },

/***/ "./src/styles.css"
/*!************************!*\
  !*** ./src/styles.css ***!
  \************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("/* Self-center regardless of slot: renderChat's parent is a flex row,\n   renderCall's is a flex column, so don't rely on Discord's chat class. */\n.shc-hidden-chat-content {\n\tdisplay: flex;\n\tflex: 1 1 auto;\n\tflex-direction: column;\n\tjustify-content: center;\n\talign-items: center;\n\tmin-height: 0;\n\theight: 100%;\n}\n\n.shc-hidden-chat-with-header {\n\tdisplay: flex;\n\tflex: 1 1 auto;\n\tflex-direction: column;\n\tmin-height: 0;\n\tmin-width: 0;\n\twidth: 100%;\n}\n\n.shc-hidden-notice {\n\tdisplay: flex;\n\tflex-direction: column;\n\ttext-align: center;\n\toverflow-y: auto;\n\tpadding: 10dvh 0px;\n\tmargin: 0px auto;\n\twidth: 100%;\n}\n\n.shc-rolePill {\n\tbackground-color: var(--background-mod-subtle);\n\tpadding: 12px;\n\tmargin: 4px 0;\n}\n");

/***/ },

/***/ "./src/utils/channelIcons.js"
/*!***********************************!*\
  !*** ./src/utils/channelIcons.js ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   installLockedChannelIcons: () => (/* binding */ installLockedChannelIcons)
/* harmony export */ });
// @ts-check

/**
 * Replace Discord's generic locked icon for voice and stage rows with the
 * matching native voice/stage icon that includes a lock badge.
 *
 * @param {{
 *  Webpack: any,
 *  Patcher: any,
 *  ChannelTypes: any,
 *  shouldShowInformation: (channel: any) => boolean,
 *  warn?: (message: string, error?: unknown) => void,
 * }} options
 * @returns {boolean}
 */
function installLockedChannelIcons({
	Webpack,
	Patcher,
	ChannelTypes,
	shouldShowInformation,
	warn,
}) {
	let hasWarned = false;
	const warnOnce = (message, error) => {
		if (hasWarned) return;
		hasWarned = true;
		try {
			warn?.(message, error);
		} catch {}
	};
	const unavailable = (error) => {
		warnOnce("Native voice/stage lock badges could not be installed.", error);
		return false;
	};

	try {
		const byStrings = Webpack?.Filters?.byStrings;
		if (
			typeof Webpack?.getWithKey !== "function" ||
			typeof Webpack?.getByKeys !== "function" ||
			typeof Webpack?.getModule !== "function" ||
			typeof byStrings !== "function" ||
			typeof Patcher?.after !== "function" ||
			typeof shouldShowInformation !== "function" ||
			typeof ChannelTypes?.GUILD_VOICE !== "number" ||
			typeof ChannelTypes?.GUILD_STAGE_VOICE !== "number"
		) {
			return unavailable();
		}

		const selectorMatch = Webpack.getWithKey(
			byStrings(
				"hasActiveThreads",
				"textFocused",
				".GUILD_STAGE_VOICE",
				".LockIcon",
			),
		);
		const [selectorModule, selectorKey] = selectorMatch ?? [];
		const LockIcon = Webpack.getByKeys("LockIcon")?.LockIcon;
		const voiceBadge = Webpack.getModule(
			byStrings("M16 4h.5v-.5", "M20.5 12c-.28 0-.5.22"),
			{ searchExports: true },
		);
		const stageBadge = Webpack.getModule(
			byStrings("M21.92 14.08c.32.27.86.15", "M16.5 18H16"),
			{ searchExports: true },
		);

		if (
			!selectorModule ||
			typeof selectorKey !== "string" ||
			typeof selectorModule[selectorKey] !== "function" ||
			typeof LockIcon !== "function" ||
			typeof voiceBadge !== "function" ||
			typeof stageBadge !== "function"
		) {
			return unavailable();
		}

		const unpatch = Patcher.after(
			selectorModule,
			selectorKey,
			(_thisObject, args, result) => {
				if (result !== LockIcon) return result;

				const channel = args?.[0];
				const settings = args?.[2];
				if (settings?.locked !== true || channel?.guild_id == null) {
					return result;
				}

				let badge;
				if (channel.type === ChannelTypes.GUILD_VOICE) badge = voiceBadge;
				else if (channel.type === ChannelTypes.GUILD_STAGE_VOICE)
					badge = stageBadge;
				else return result;

				try {
					return shouldShowInformation(channel) ? badge : result;
				} catch (error) {
					warnOnce(
						"Could not check whether a locked channel should show its badge.",
						error,
					);
					return result;
				}
			},
		);
		if (typeof unpatch !== "function") {
			return unavailable(
				new Error("Patcher.after did not return an unpatch function."),
			);
		}

		return true;
	} catch (error) {
		return unavailable(error);
	}
}


/***/ },

/***/ "./src/utils/date.js"
/*!***************************!*\
  !*** ./src/utils/date.js ***!
  \***************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   convertToHMS: () => (/* binding */ convertToHMS),
/* harmony export */   getDateFromSnowflake: () => (/* binding */ getDateFromSnowflake)
/* harmony export */ });
/* harmony import */ var _modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modules */ "./src/utils/modules.js");
// @ts-check



const { Logger, LocaleManager } = (0,_modules__WEBPACK_IMPORTED_MODULE_0__.getModules)();

function convertToHMS(timeInSeconds) {
	const hours = Math.floor(timeInSeconds / 3600);
	const minutes = Math.floor((timeInSeconds % 3600) / 60);
	const seconds = Math.floor((timeInSeconds % 3600) % 60);

	const formatTime = (value, unit) =>
		value > 0 ? `${value} ${unit}${value > 1 ? "s" : ""}` : "";

	return [
		formatTime(hours, "hour"),
		formatTime(minutes, "minute"),
		formatTime(seconds, "second"),
	].join(" ");
}

function getDateFromSnowflake(snowflake) {
	try {
		const DISCORD_EPOCH = BigInt("1420070400000");
		const id = BigInt(snowflake);
		const unix = (id >> BigInt(22)) + DISCORD_EPOCH;

		return new Date(Number(unix)).toLocaleString(LocaleManager._chosenLocale);
	} catch (err) {
		Logger.err(err);
		return "(Failed to get date)";
	}
}


/***/ },

/***/ "./src/utils/dispatcher.js"
/*!*********************************!*\
  !*** ./src/utils/dispatcher.js ***!
  \*********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getDispatcherNodes: () => (/* binding */ getDispatcherNodes),
/* harmony export */   getStoreActionHandler: () => (/* binding */ getStoreActionHandler)
/* harmony export */ });
// @ts-check

/**
 * @param {any} dispatcher
 * @returns {any[]}
 */
function getDispatcherNodes(dispatcher) {
	const actionHandlers = dispatcher?._actionHandlers;
	const nodes = actionHandlers?._nodes;

	if (typeof nodes?.values === "function") {
		try {
			return Array.from(nodes.values());
		} catch {
			// Fall through to the legacy dependency graph.
		}
	}

	const legacyNodes = actionHandlers?._dependencyGraph?.nodes;
	if (Array.isArray(legacyNodes)) return legacyNodes;
	if (legacyNodes && typeof legacyNodes === "object") {
		return Object.values(legacyNodes);
	}

	return [];
}

/**
 * @param {any} store
 * @param {any} fallbackDispatcher
 * @returns {any}
 */
function getStoreActionHandler(store, fallbackDispatcher) {
	const dispatchToken = store?._dispatchToken;
	if (dispatchToken == null) return undefined;

	const dispatcher = store?._dispatcher ?? fallbackDispatcher;
	const actionHandlers = dispatcher?._actionHandlers;
	const nodes = actionHandlers?._nodes;

	if (typeof nodes?.get === "function") {
		try {
			const handler = nodes.get(dispatchToken)?.actionHandler;
			if (handler !== undefined) return handler;
		} catch {
			// Fall through to the legacy dependency graph.
		}
	}

	const legacyNodes = actionHandlers?._dependencyGraph?.nodes;
	return legacyNodes?.[dispatchToken]?.actionHandler;
}


/***/ },

/***/ "./src/utils/modules.js"
/*!******************************!*\
  !*** ./src/utils/modules.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Logger: () => (/* binding */ Logger),
/* harmony export */   UnloadModules: () => (/* binding */ UnloadModules),
/* harmony export */   getModules: () => (/* binding */ getModules),
/* harmony export */   loaded_successfully: () => (/* binding */ loaded_successfully)
/* harmony export */ });
/* harmony import */ var _dispatcher__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./dispatcher */ "./src/utils/dispatcher.js");
// @ts-check



const Logger = {
	isDebugging: false,
	_log: (type, color, ...x) => {
		const line = new Error().stack || "";
		const lines = line.split("\n");

		// console.debug does not work in stable
		const consoleMethod = type === "debug" ? "log" : type;

		console[consoleMethod](
			`%c SHC %c ${type.toUpperCase()} %c`,
			"background: #5968f0; color: white; font-weight: bold; border-radius: 5px;",
			`background: ${color}; color: black; font-weight: bold; border-radius: 5px; margin-left: 5px;`,
			"",
			...x,
			`\n\n${lines[3].substring(lines[3].indexOf("("), lines[3].lastIndexOf(")") + 1)}`,
		);
	},
	info: (...x) => {
		Logger._log("log", "#2f3781", ...x);
	},
	warn: (...x) => {
		Logger._log("warn", "#f0b859", ...x);
	},
	err: (...x) => {
		Logger._log("error", "#f05959", ...x);
	},
	debug: (...x) => {
		if (!Logger.isDebugging) return;

		Logger._log("debug", "#f05959", ...x);
	},
};

let loaded_successfully = true;

let cachedModules = null;

const {
	React,
	ReactDOM,
	ReactUtils: ReactTools,
	DOM: DOMTools,
	ContextMenu,
	Utils: Utilities,
	// Webpack: WebpackModules,
	Components: { Tooltip, Text: TextElement },
} = BdApi;

// TODO: Add this to above when BdApi types are updated
/**
 * @type {typeof BdApi.Webpack & { getBySource: (source: string | RegExp, ...filters: string[]) => any, getMangled: (module: string | RegExp, filters: Record<string,  (...args: any[]) => boolean>) => any }}
 */
// @ts-expect-error
const WebpackModules = BdApi.Webpack;

function getModules() {
	if (cachedModules) return cachedModules;
	loaded_successfully = true;
	const DiscordPermissions = WebpackModules.getModule((m) => m.ADD_REACTIONS, {
		searchExports: true,
	});
	const ImageResolver = WebpackModules.getByKeys(
		"getUserAvatarURL",
		"getGuildIconURL",
	);
	const UserStore = WebpackModules.getStore("UserStore");

	// DiscordModules
	const ChannelStore = WebpackModules.getStore("ChannelStore");
	const GuildStore = WebpackModules.getStore("GuildStore");
	const GuildRoleStore = WebpackModules.getStore("GuildRoleStore");

	const GuildChannelStore = WebpackModules.getStore("GuildChannelStore");
	const GuildMemberStore = WebpackModules.getByKeys("getMember");
	const NavigationUtils = WebpackModules.getMangled(
		"transitionTo - Transitioning to ",
		{
			transitionTo: WebpackModules.Filters.byStrings(
				"transitionTo - Transitioning to ",
			),
		},
	);

	if (!NavigationUtils?.transitionTo) {
		loaded_successfully = false;
		Logger.err("Failed to load NavigationUtils", NavigationUtils);
	}

	const LocaleManager = WebpackModules.getByKeys("setLocale");

	const DiscordConstants = {};

	DiscordConstants.Permissions = DiscordPermissions;

	DiscordConstants.ChannelTypes = WebpackModules.getModule(
		(x) => x.GUILD_VOICE,
		{
			searchExports: true,
		},
	);

	DiscordConstants.NOOP = () => {};

	if (
		!DiscordConstants.Permissions ||
		!DiscordConstants.ChannelTypes ||
		!DiscordConstants.NOOP
	) {
		loaded_successfully = false;
		Logger.err("Failed to load DiscordConstants", DiscordConstants);
	}

	const chat = WebpackModules.getByKeys("chat", "chatContent")?.chat;

	const Route = WebpackModules.getBySource(/.ImpressionTypes.PAGE,name:\w+,/);

	const ChannelItemRenderer = WebpackModules.getMangled(
		'location:"channel_item"',
		{
			render: WebpackModules.Filters.byStrings(
				"connectDragPreview:",
				".ALL_MESSAGES",
			),
		},
	);
	if (typeof ChannelItemRenderer?.render !== "function") {
		loaded_successfully = false;
		Logger.err("Failed to load ChannelItemRenderer", ChannelItemRenderer);
	}

	const RolePill = WebpackModules.getMangled("overflow-more-roles-", {
		RolePill: WebpackModules.Filters.byStrings(
			"disableBorderColor",
			"onContextMenu",
		),
	})?.RolePill;

	const ChannelPermissionStore = WebpackModules.getByKeys(
		"getChannelPermissions",
	);
	if (!ChannelPermissionStore?.can) {
		loaded_successfully = false;
		Logger.err("Failed to load ChannelPermissionStore", ChannelPermissionStore);
	}

	const fluxDispatcher = WebpackModules.getByKeys("dispatch", "subscribe", {
		searchExports: true,
	});
	const PermissionStore = WebpackModules.getStore("PermissionStore");
	const ChannelListStore = WebpackModules.getStore("ChannelListStore");

	const PermissionStoreActionHandler = (0,_dispatcher__WEBPACK_IMPORTED_MODULE_0__.getStoreActionHandler)(
		PermissionStore,
		fluxDispatcher,
	);

	const ChannelListStoreActionHandler = (0,_dispatcher__WEBPACK_IMPORTED_MODULE_0__.getStoreActionHandler)(
		ChannelListStore,
		fluxDispatcher,
	);

	const container = WebpackModules.getByKeys(
		"container",
		"hubContainer",
	)?.container;

	const createChannelRecord = BdApi.Webpack.getByKeys(
		"createChannelRecord",
	)?.createChannelRecord;

	const DEFAULT_AVATARS =
		WebpackModules.getByKeys("DEFAULT_AVATARS")?.DEFAULT_AVATARS;

	const { iconItem, actionIcon } = WebpackModules.getByKeys("iconItem") || {};

	const ReadStateStore = WebpackModules.getStore("ReadStateStore");
	const Voice = WebpackModules.getByKeys("getVoiceStateStats");

	const UserMentions = WebpackModules.getByKeys("handleUserContextMenu");

	const ProfileActions = WebpackModules.getMangled(
		"setFlag: user cannot be undefined",
		{
			fetchProfile: WebpackModules.Filters.byStrings(
				"USER_PROFILE_FETCH_START",
			),
		},
	);

	if (!ProfileActions.fetchProfile) {
		loaded_successfully = false;
		Logger.err("Failed to load ProfileActions", ProfileActions);
	}

	const PermissionUtils = WebpackModules.getMangled(
		".computeLurkerPermissionsAllowList()",
		{
			can: WebpackModules.Filters.byStrings("excludeGuildPermissions:"),
		},
	);

	const CategoryStore = WebpackModules.getByKeys(
		"isCollapsed",
		"getCollapsedCategories",
	);

	const modules = {
		/* Library */
		Utilities,
		DOMTools,
		Logger,
		ReactTools,

		/* Discord Modules (From lib) */
		ChannelStore,
		React,
		ReactDOM,
		GuildChannelStore,
		GuildMemberStore,
		LocaleManager,
		NavigationUtils,
		ImageResolver,
		UserStore,

		ContextMenu,
		Components: {
			Tooltip,
			TextElement,
		},

		/* Manually found modules */
		GuildStore,
		GuildRoleStore,
		DiscordConstants,
		chat,
		Route,
		ChannelItemRenderer,
		ChannelPermissionStore,
		PermissionStoreActionHandler,
		ChannelListStoreActionHandler,
		container,
		createChannelRecord,
		ChannelListStore,
		DEFAULT_AVATARS,
		iconItem,
		actionIcon,
		ReadStateStore,
		Voice,
		RolePill,
		UserMentions,
		ProfileActions,
		PermissionUtils,
		CategoryStore,
	};

	loaded_successfully = checkVariables(modules);
	cachedModules = modules;
	return modules;
}

function UnloadModules() {
	cachedModules = null;
}

function checkVariables(modules) {
	for (const variable in modules) {
		if (!modules[variable]) {
			Logger.err(`Variable not found: ${variable}`);
		}
	}

	for (const component in modules.Components) {
		if (!modules.Components[component]) {
			Logger.err(`Component not found: ${component}`);
		}
	}

	if (!loaded_successfully) {
		Logger.err("Failed to load internal modules.");
		return false;
	}

	if (
		Object.values(modules).includes(undefined) ||
		Object.values(modules.Components).includes(undefined)
	) {
		Logger.err("Some modules are undefined.");
		return false;
	}

	Logger.info("All variables found.");
	return true;
}


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	// define getter/value functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop));
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _styles_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./styles.css */ "./src/styles.css");
/* harmony import */ var _utils_channelIcons__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/channelIcons */ "./src/utils/channelIcons.js");
/* harmony import */ var _utils_dispatcher__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils/dispatcher */ "./src/utils/dispatcher.js");
// @ts-check
/** @typedef {import('./discord').SHCChannel} SHCChannel */




const config = {
	info: {
		name: "ShowHiddenChannels",
		authors: [
			{
				name: "JustOptimize (Oggetto)",
			},
			{
				name: "XxUnkn0wnxX (AI)",
			},
		],
		description:
			"A plugin which displays all hidden Channels and allows users to view information about them, this won't allow you to read them (impossible).",
		version: "6.14",
		github: `https://github.com/${"XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels"}/tree/main`,
	},

	changelog: [{"title":"v6.14 - Discord Update","type":"fixed","items":["Fixed the hidden channel lock icon and role pills missing after a Discord update."]},{"title":"v6.13 - Discord Dispatcher Update","type":"fixed","items":["Upstream fixed startup after Discord's dispatcher update (#291); this fork already included current and legacy dispatcher support in v6.12."]},{"title":"v6.12 - Native Channel Header","type":"changed","items":["Hidden channels now keep Discord's real header, including its formatted topic and See More expander.","Hidden and visible locked voice/stage channels replace their content with channel information and hide side panels; the native header toolbar retains the mute button where available.","Fixed the lock screen not centering on hidden voice channels.","Forum channels are labelled correctly instead of \"unknown\", and hidden spoiler channels now say so.","Refreshed dead Discord CSS variables so the permissions and forum panels have their background and text back.","Restored startup compatibility with Discord's current dispatcher storage.","Locked voice and stage channel padlocks now retain their channel-type symbol with Discord's native small lock badge.","Settings selections now update immediately while the panel remains open.","Native view and toolbar patches now restore cleanly when the plugin stops; failed view capture retains a plain-text topic fallback."]},{"title":"v6.11.1 - Discord Topic Compatibility","type":"fixed","items":["Restored hidden-channel topics after Discord added new channel types."]},{"title":"v6.11 - Discord Compatibility & Fork Publishing","type":"fixed","items":["Restored current Discord compatibility by using native VIEW_CHANNEL denials instead of the removed channel isHidden method.","Synthetic categories now use Discord's createChannelRecord factory.","An unavailable optional topic renderer no longer makes plugin startup fatal.","Builds now inject the resolved fork repository into self-updates, @source, and @updateUrl; fork builds use the stable rolling Nightly-Fork release and no longer support prereleases.","The split build and publisher workflows now publish the plugin alongside matching GitHub source archives."]},{"title":"v6.10 - Reliability Improvements","type":"fixed","items":["Plugin now waits for Discord to be ready before starting instead of using a fixed 1s delay.","Pre-release update checking now correctly picks the newest version instead of blindly grabbing the first GitHub release.","Logger is now exported directly so it's usable before modules are fully loaded.","Fixed console.debug being suppressed on Discord stable (falls back to console.log).","Fixed loaded_successfully flag not resetting on module refetch."]},{"title":"v6.9 - Lazy Module Loading","type":"changed","items":["Modules are now loaded lazily on first use instead of at import time, fixing startup failures when Discord's webpack isn't ready.","Added runAt: idle to ensure the plugin starts after Discord is fully loaded.","Dropped the 0. version prefix and fixed version comparison to be numeric.","Added pre-release version support (e.g. 6.9-pre1).","69... (nice)"]},{"title":"v0.6.8 - Fixes","type":"fixed","items":["Updated module queries after Discord update.","Added some typescript types","No longer 67 :("]}],

	main: "ShowHiddenChannels.plugin.js",
	github_short: "XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels",
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((() => {
	// biome-ignore lint/security/noGlobalEval: This is a necessary evil
	const RuntimeRequire = eval("require");
	const PRIVATE_CHANNEL_HIDING_EXPERIMENT_ID =
		"2026-02-private-channel-hiding";
	const PRIVATE_CHANNEL_HIDING_NOT_ELIGIBLE_VARIANT = -1;
	const UPSTREAM_REPOSITORY = "JustOptimize/ShowHiddenChannels";
	const ROLLING_RELEASE_TAG = "Nightly-Fork";
	const isForkBuild = config.github_short !== UPSTREAM_REPOSITORY;
	const releaseApiUrl = isForkBuild
		? `https://api.github.com/repos/${config.github_short}/releases/tags/${ROLLING_RELEASE_TAG}`
		: `https://api.github.com/repos/${UPSTREAM_REPOSITORY}/releases/latest`;
	const UPDATE_FETCH_OPTIONS = {
		timeout: 15000,
		maxRedirects: 20,
		headers: {
			"User-Agent": `${config.info.name}/${config.info.version}`,
		},
	};
	const RELEASE_FETCH_OPTIONS = {
		...UPDATE_FETCH_OPTIONS,
		headers: {
			...UPDATE_FETCH_OPTIONS.headers,
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28",
		},
	};
	const PLUGIN_VERSION_PATTERN = /^\d+(?:\.\d+)*$/;

	const parsePluginHeader = (content) => {
		if (typeof content !== "string" || !content) return null;

		const header = content.match(/^\s*\/\*\*[\s\S]*?\*\//)?.[0];
		const name = header?.match(
			/^\s*\*\s*@name\s+([^\r\n]+?)\s*$/m,
		)?.[1];
		const version = header?.match(
			/^\s*\*\s*@version\s+([^\r\n]+?)\s*$/m,
		)?.[1];

		if (
			name !== config.info.name ||
			!PLUGIN_VERSION_PATTERN.test(version ?? "")
		) {
			return null;
		}

		return { name, version };
	};

	const defaultSettings = {
		hiddenChannelIcon: "lock",
		sort: "native",
		showPerms: true,
		showAdmin: "channel",
		MarkUnread: false,

		checkForUpdates: true,

		shouldShowEmptyCategory: false,
		debugMode: false,

		channels: {
			GUILD_TEXT: true,
			GUILD_VOICE: true,
			GUILD_ANNOUNCEMENT: true,
			GUILD_STORE: true,
			GUILD_STAGE_VOICE: true,
			GUILD_FORUM: true,
		},

		blacklistedGuilds: {},
	};

	return class ShowHiddenChannels {
		constructor(meta) {
			this.meta = meta;
			this.api = new BdApi(meta.name);

			this.hiddenChannelCache = {};
			this.privateChannelHidingHotfixWarnings = new Set();
			this.lockedVoicePatchWarnings = new Set();

			this.collapsed = {};
			this.processContextMenu = this?.processContextMenu?.bind(this);
			const savedSettings = { ...(this.api.Data.load("settings") ?? {}) };
			const hasLegacyPreRelease = Object.hasOwn(
				savedSettings,
				"usePreRelease",
			);
			delete savedSettings.usePreRelease;
			this.settings = Object.assign({}, defaultSettings, savedSettings);
			if (hasLegacyPreRelease) {
				try {
					this.api.Data.save("settings", this.settings);
				} catch (error) {
					console.warn("[ShowHiddenChannels] Failed to migrate legacy settings.", error);
				}
			}
		}

		semverGt(a, b) {
			const parse = (v) => {
				if (typeof v !== "string" || !/^\d+(?:\.\d+)*$/.test(v)) {
					return null;
				}

				return v.split(".").map(Number);
			};
			const av = parse(a);
			const bv = parse(b);
			if (!av || !bv) return false;

			for (let i = 0; i < Math.max(av.length, bv.length); i++) {
				const diff = (av[i] ?? 0) - (bv[i] ?? 0);
				if (diff !== 0) return diff > 0;
			}

			return false;
		}

		async checkForUpdates() {
			const { Logger } = __webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js");

			Logger.debug(
				`Checking for updates, current version: ${config.info.version}`,
			);

			const failedCheck = (source, detail) => {
				let reason = "Unknown error";
				if (typeof detail === "number") reason = `HTTP ${detail}`;
				else if (detail instanceof Error) reason = detail.message || detail.name;
				else if (typeof detail === "string" && detail) reason = detail;

				Logger.warn(`Failed to check for updates (${source}): ${reason}`);
				this.api.UI.showToast(
					"(ShowHiddenChannels) Failed to check for updates.",
					{
						type: "error",
					},
				);
			};

			let release;
			try {
				const releaseResponse = await this.api.Net.fetch(
					releaseApiUrl,
					RELEASE_FETCH_OPTIONS,
				);
				if (!releaseResponse?.ok) {
					return failedCheck("release API", releaseResponse?.status);
				}

				release = await releaseResponse.json();
			} catch (error) {
				return failedCheck("release API", error);
			}

			const pluginAsset = Array.isArray(release?.assets)
				? release.assets.find(
						(asset) =>
							asset?.name === config.main &&
							typeof asset.browser_download_url === "string" &&
							asset.browser_download_url.length > 0,
					)
				: undefined;

			if (
				release?.draft !== false ||
				release?.prerelease !== false ||
				(isForkBuild && release?.tag_name !== ROLLING_RELEASE_TAG) ||
				!pluginAsset
			) {
				this.api.UI.alert(
					config.info.name,
					"Failed to check for updates, version not found.",
				);

				return Logger.err("Failed to check for updates, version not found.");
			}

			let SHCContent;
			try {
				const pluginResponse = await this.api.Net.fetch(
					pluginAsset.browser_download_url,
					UPDATE_FETCH_OPTIONS,
				);
				if (!pluginResponse?.ok) {
					return failedCheck("plugin asset", pluginResponse?.status);
				}

				SHCContent = await pluginResponse.text();
			} catch (error) {
				return failedCheck("plugin asset", error);
			}

			const pluginMetadata = parsePluginHeader(SHCContent);
			if (!pluginMetadata) {
				this.api.UI.alert(
					config.info.name,
					"Failed to check for updates, plugin metadata not found.",
				);

				return Logger.err(
					"Failed to check for updates, plugin metadata not found.",
				);
			}

			const releaseVersion = pluginMetadata.version;
			Logger.debug(`Latest plugin version: ${releaseVersion}`);

			if (!this.semverGt(releaseVersion, config.info.version)) {
				return Logger.info("No updates found.");
			}

			const releaseTitle = isForkBuild
				? `v${releaseVersion} - ${ROLLING_RELEASE_TAG}`
				: `v${releaseVersion}`;
			this.api.UI.showConfirmationModal(
				"Update available",
				`ShowHiddenChannels has an update available. Would you like to update to ${releaseTitle}?`,
				{
					confirmText: "Update",
					cancelText: "Cancel",
					danger: false,

					onConfirm: async () => {
						await this.proceedWithUpdate(SHCContent, releaseVersion);
					},

					onCancel: () => {
						this.api.UI.showToast("Update cancelled.", {
							type: "info",
						});
					},
				},
			);
		}

		async proceedWithUpdate(SHCContent, version) {
			const { Logger } = __webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js");

			Logger.debug(
				`Update confirmed by the user, updating to version ${version}`,
			);

			const failed = () => {
				this.api.UI.showToast("(ShowHiddenChannels) Failed to update.", {
					type: "error",
				});
			};

			if (typeof SHCContent !== "string" || !SHCContent) return failed();

			const pluginMetadata = parsePluginHeader(SHCContent);

			if (!pluginMetadata || pluginMetadata.version !== version) {
				return failed();
			}

			try {
				const fs = RuntimeRequire("fs");
				const path = RuntimeRequire("path");

				await fs.promises.writeFile(
					path.join(this.api.Plugins.folder, config.main),
					SHCContent,
				);

				this.api.UI.showToast(
					`ShowHiddenChannels updated to version ${version}`,
					{
						type: "success",
					},
				);
			} catch (_err) {
				return failed();
			}
		}

		async start() {
			const { Logger } = __webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js");

			Logger.info(`Starting plugin...`);
			Logger.isDebugging = this.settings.debugMode;

			await new Promise((resolve) => {
				const start = Date.now();
				const interval = setInterval(() => {
					const container = BdApi.Webpack.getByKeys(
						"container",
						"hubContainer",
					)?.container;
					if (container) {
						clearInterval(interval);
						resolve();
					} else if (Date.now() - start >= 10000) {
						clearInterval(interval);
						Logger.err("Timed out waiting for container module after 10s");
						resolve();
					}
				}, 500);
			});

			Logger.info(`Checking for updates...`);

			if (this.settings.checkForUpdates) {
				await this.checkForUpdates();
			}

			// First call to the modules loader
			const { ChannelPermissionStore } =
				(__webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js").getModules)();

			this.can =
				ChannelPermissionStore.can.__originalFunction ??
				ChannelPermissionStore.can;

			const { loaded_successfully } = __webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js");

			if (loaded_successfully) {
				this.doStart();
			} else {
				this.api.UI.showConfirmationModal(
					`(SHC v${config.info.version}) Broken Modules`,
					"ShowHiddenChannels has detected that some modules are broken, would you like to start anyway? (This might break the plugin or Discord itself)",
					{
						confirmText: "Start anyway",
						cancelText: "Cancel",
						danger: true,

						onConfirm: () => {
							this.doStart();
						},

						onCancel: () => {
							this.api.Plugins.disable("ShowHiddenChannels");
						},
					},
				);
			}
		}

		doStart() {
			const { DOMTools } = (__webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js").getModules)();

			const savedVersion = this.api.Data.load("version");
			if (savedVersion !== this.meta.version) {
				this.api.UI.showChangelogModal({
					title: this.meta.name,
					subtitle: `v${this.meta.version}`,
					changes: config.changelog,
				});
				this.api.Data.save("version", config.info.version);
			}

			this.applyPrivateChannelHidingExperimentHotfix();
			DOMTools.addStyle(config.info.name, _styles_css__WEBPACK_IMPORTED_MODULE_0__["default"]);
			this.Patch();
			this.rerenderChannels();
		}

		isHiddenChannel(channel) {
			// `PermissionStore.can` also accepts guilds, which have no channel type.
			if (typeof channel?.type !== "number") return false;

			const { DiscordConstants } = (__webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js").getModules)();
			const { DM, GROUP_DM } = DiscordConstants.ChannelTypes;

			if ([DM, GROUP_DM].includes(channel.type)) return false;

			// Skip Discord's top-level guide, browse, and role-selection entries.
			if (["browse", "customize", "guide"].includes(channel.id)) return false;

			return !this.can(DiscordConstants.Permissions.VIEW_CHANNEL, channel);
		}

		/**
		 * Temporary hotfix for Discord's 2026-02-private-channel-hiding experiment.
		 * Keep this isolated so it can be removed once SHC has a better long-term path.
		 */
		applyPrivateChannelHidingExperimentHotfix() {
			const { Logger } = __webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js");
			const experimentStore = this.getPrivateChannelHidingExperimentStore();
			const currentVariant = this.getPrivateChannelHidingVariant(experimentStore);

			if (!experimentStore || typeof currentVariant !== "number") {
				this.warnPrivateChannelHidingHotfixOnce(
					"experiment-not-found",
					`Experiment ${PRIVATE_CHANNEL_HIDING_EXPERIMENT_ID} not found; private-channel-hiding hotfix was not applied.`,
				);
				return;
			}

			if (currentVariant === PRIVATE_CHANNEL_HIDING_NOT_ELIGIBLE_VARIANT) {
				Logger.info(
					`Private channel hiding experiment already reads Not Eligible (${PRIVATE_CHANNEL_HIDING_NOT_ELIGIBLE_VARIANT}); refreshing visible override.`,
				);
			}

			const dispatcher = this.getDiscordDispatcher();
			if (typeof dispatcher?.dispatch !== "function") {
				this.warnPrivateChannelHidingHotfixOnce(
					"dispatcher-not-found",
					"Discord dispatcher not found; private-channel-hiding hotfix was not applied.",
				);
				return;
			}

			const hasApexOverrideHandler = this.getDispatcherNodes().some(
				(node) =>
					node?.name === "ApexExperimentStore" &&
					typeof node?.actionHandler?.APEX_EXPERIMENT_OVERRIDE_CREATE ===
						"function",
			);

			if (!hasApexOverrideHandler) {
				this.warnPrivateChannelHidingHotfixOnce(
					"not-eligible-action-not-found",
					`Not Eligible override action for ${PRIVATE_CHANNEL_HIDING_EXPERIMENT_ID} not found; private-channel-hiding hotfix was not applied.`,
				);
				return;
			}

			dispatcher.dispatch({
				type: "APEX_EXPERIMENT_OVERRIDE_CREATE",
				experimentName: PRIVATE_CHANNEL_HIDING_EXPERIMENT_ID,
				variantId: PRIVATE_CHANNEL_HIDING_NOT_ELIGIBLE_VARIANT,
			});
			Logger.info(
				`Private channel hiding experiment override dispatched as Not Eligible (${PRIVATE_CHANNEL_HIDING_NOT_ELIGIBLE_VARIANT}).`,
			);

			window.setTimeout(() => {
				const nextVariant =
					this.getPrivateChannelHidingVariant(experimentStore);

				if (
					nextVariant !== PRIVATE_CHANNEL_HIDING_NOT_ELIGIBLE_VARIANT
				) {
					this.warnPrivateChannelHidingHotfixOnce(
						"not-eligible-not-applied",
						`Not Eligible option for ${PRIVATE_CHANNEL_HIDING_EXPERIMENT_ID} did not apply; current variant is ${String(nextVariant)}.`,
					);
					return;
				}

				Logger.info(
					`Private channel hiding experiment forced to Not Eligible (${PRIVATE_CHANNEL_HIDING_NOT_ELIGIBLE_VARIANT}). Restart Discord and delete Cache and Code Cache if channel names were already cached as No Access.`,
				);
			}, 500);
		}

		getPrivateChannelHidingExperimentStore() {
			const Webpack = BdApi?.Webpack;
			const candidates = [
				Webpack?.getStore?.("ExperimentStore"),
				Webpack?.getByKeys?.(
					"getUserExperimentBucket",
					"getUserExperimentDescriptor",
				),
				...this.getDispatcherNodes()
					.filter((node) => node?.name === "ExperimentStore")
					.map((node) => node?.store ?? node),
			];

			return candidates.find(
				(candidate) =>
					candidate && typeof candidate.getUserExperimentBucket === "function",
			);
		}

		getPrivateChannelHidingVariant(experimentStore) {
			try {
				return experimentStore?.getUserExperimentBucket?.(
					PRIVATE_CHANNEL_HIDING_EXPERIMENT_ID,
				);
			} catch {
				return undefined;
			}
		}

		getDiscordDispatcher() {
			const Webpack = BdApi?.Webpack;
			return (
				Webpack?.getStore?.("UserStore")?._dispatcher ||
				Webpack?.getByKeys?.("dispatch", "subscribe", "unsubscribe", {
					searchExports: true,
				})
			);
		}

		getDispatcherNodes() {
			return (0,_utils_dispatcher__WEBPACK_IMPORTED_MODULE_2__.getDispatcherNodes)(this.getDiscordDispatcher());
		}

		warnPrivateChannelHidingHotfixOnce(key, message) {
			if (this.privateChannelHidingHotfixWarnings.has(key)) return;

			this.privateChannelHidingHotfixWarnings.add(key);
			(__webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js").Logger).warn(message);
		}

		warnLockedVoicePatchOnce(key, message, details) {
			if (this.lockedVoicePatchWarnings.has(key)) return;

			this.lockedVoicePatchWarnings.add(key);
			(__webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js").Logger).warn(message, details);
			this.api.UI.showToast(`(SHC) ${message}`, {
				type: "warning",
			});
		}

		Patch() {
			const { Lockscreen } = __webpack_require__(/*! ./components/Lockscreen */ "./src/components/Lockscreen.jsx");
			const { HiddenChannelIcon } = __webpack_require__(/*! ./components/HiddenChannelIcon */ "./src/components/HiddenChannelIcon.jsx");
			const Patcher = this.api.Patcher;

			const {
				/* Library */
				Utilities,
				ReactTools,
				// DOMTools,
				Logger,

				/* Discord Modules (From lib) */
				ChannelStore,
				React,
				GuildChannelStore,
				NavigationUtils,

				/* BdApi */
				ContextMenu,

				/* Manually found modules */
				DiscordConstants,
				chat,
				Route,
				ChannelItemRenderer,
				ChannelPermissionStore,
				// PermissionStoreActionHandler,
				// ChannelListStoreActionHandler,
				// container,
				createChannelRecord,
				ChannelListStore,
				iconItem,
				actionIcon,
				ReadStateStore,
				Voice,
				CategoryStore,
			} = (__webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js").getModules)();

			// Check for needed modules
			if (
				typeof createChannelRecord !== "function" ||
				!DiscordConstants ||
				!ChannelStore ||
				!ChannelPermissionStore?.can ||
				!ChannelListStore?.getGuild ||
				!DiscordConstants?.ChannelTypes
			) {
				return this.api.UI.showToast(
					"(SHC) Some crucial modules are missing, aborting. (Wait for an update)",
					{
						type: "error",
					},
				);
			}

			if (!ReadStateStore) {
				this.api.UI.showToast(
					"(SHC) ReadStateStore module is missing, channels will be marked as unread.",
					{
						type: "warning",
					},
				);
			}

			const nativeChannelIconPatchInstalled = (0,_utils_channelIcons__WEBPACK_IMPORTED_MODULE_1__.installLockedChannelIcons)({
				Webpack: BdApi?.Webpack,
				Patcher,
				ChannelTypes: DiscordConstants.ChannelTypes,
				shouldShowInformation: (channel) =>
					this.isHiddenChannel(channel) ||
					!this.can(DiscordConstants.Permissions.CONNECT, channel),
				warn: (message, error) => Logger.warn(message, error),
			});
			if (nativeChannelIconPatchInstalled) {
				Logger.debug("Native voice/stage lock badge patch installed.");
			}

			Patcher.after(
				ReadStateStore,
				"getGuildChannelUnreadState",
				(_, args, res) => {
					if (this.settings.MarkUnread) return res;

					const [channel] = /** @type {[SHCChannel]} */ (args);
					return this.isHiddenChannel(channel)
						? {
								mentionCount: 0,
								unread: false,
							}
						: res;
				},
			);

			Patcher.after(ReadStateStore, "getMentionCount", (_, args, res) => {
				if (this.settings.MarkUnread) return res;

				return this.isHiddenChannel(ChannelStore.getChannel(args[0])) ? 0 : res;
			});

			Patcher.after(ReadStateStore, "getUnreadCount", (_, args, res) => {
				if (this.settings.MarkUnread) return res;

				return this.isHiddenChannel(ChannelStore.getChannel(args[0])) ? 0 : res;
			});

			Patcher.after(ReadStateStore, "hasTrackedUnread", (_, args, res) => {
				if (this.settings.MarkUnread) return res;

				return res && !this.isHiddenChannel(ChannelStore.getChannel(args[0]));
			});

			Patcher.after(ReadStateStore, "hasUnread", (_, args, res) => {
				if (this.settings.MarkUnread) return res;

				return res && !this.isHiddenChannel(ChannelStore.getChannel(args[0]));
			});

			Patcher.after(ReadStateStore, "hasUnreadPins", (_, args, res) => {
				if (this.settings.MarkUnread) return res;

				return res && !this.isHiddenChannel(ChannelStore.getChannel(args[0]));
			});

			//* Make hidden channel visible
			Patcher.after(ChannelPermissionStore, "can", (_, args, res) => {
				const [permission, channel] = /** @type {[bigint, SHCChannel]} */ (
					args
				);
				if (!this.isHiddenChannel(channel)) return res;

				if (permission === DiscordConstants.Permissions.VIEW_CHANNEL) {
					return (
						!this.settings.blacklistedGuilds[channel.guild_id] &&
						this.settings.channels[DiscordConstants.ChannelTypes[channel.type]]
					);
				}

				if (permission === DiscordConstants.Permissions.CONNECT) {
					return false;
				}

				return res;
			});

			if (!Voice || !Route) {
				this.api.UI.showToast(
					"(SHC) Voice or Route modules are missing, channel lockscreen won't work.",
					{
						type: "warning",
					},
				);
			}

			// Keep Discord's native header and replace only the informational
			// channel's content. The unexported class is captured from its fiber.
			let channelViewPatched = false;
			let captureWarningShown = false;
			const toolbarPatched = new WeakSet();
			const { GUILD_VOICE, GUILD_STAGE_VOICE } = DiscordConstants.ChannelTypes;
			const isVoiceLike = (type) =>
				type === GUILD_VOICE || type === GUILD_STAGE_VOICE;

			const getInformationState = (channel) => {
				if (!channel || channel.id === Voice?.getChannelId()) return null;
				const hidden = this.isHiddenChannel(channel);
				const locked =
					channel.isGuildVocal?.() &&
					!this.can(DiscordConstants.Permissions.CONNECT, channel);
				return hidden || locked
					? { isLockedVoiceChannel: Boolean(locked && !hidden) }
					: null;
			};

			const patchToolbar = (view) => {
				if (toolbarPatched.has(view)) return;
				if (typeof view.renderHeaderToolbar !== "function") return;
				const undo = Patcher.after(
					view,
					"renderHeaderToolbar",
					(self, _, items) => {
						if (
							!getInformationState(self.props?.channel) ||
							!Array.isArray(items)
						) {
							return items;
						}
						return items.filter((item) => item?.key === "notifications");
					},
				);
				toolbarPatched.add(view);
				return undo;
			};

			const patchChannelView = (instance) => {
				const prototype = instance?.constructor?.prototype;
				if (
					![
						"render",
						"renderChat",
						"renderCall",
						"renderSidebar",
						"shouldRenderCall",
					].every((method) => typeof prototype?.[method] === "function") ||
					typeof instance.renderHeaderBar !== "function" ||
					typeof instance.renderHeaderToolbar !== "function"
				) {
					return false;
				}

				const undoPatches = [];
				try {
					// Only one content slot owns the lockscreen, including when Discord
					// would normally substitute subscription, spoiler or age gating.
					const swapWhen = (wantVoice) => (self, args, original) => {
						const channel = self?.props?.channel;
						const information = getInformationState(channel);
						if (!information) return original.apply(self, args);
						if (isVoiceLike(channel.type) !== wantVoice) return null;

						const lockscreen = React.createElement(Lockscreen, {
							chat,
							channel,
							settings: this.settings,
							...information,
							showTopic: false,
						});
						// render() omits its outer header for calls and activity panels.
						if (
							!self.shouldRenderCall() &&
							!self.props.hasTextActivityInPanelMode
						) {
							return lockscreen;
						}
						return React.createElement(
							wantVoice ? React.Fragment : "div",
							wantVoice ? null : { className: "shc-hidden-chat-with-header" },
							self.renderHeaderBar(),
							lockscreen,
						);
					};

					undoPatches.push(
						Patcher.instead(prototype, "renderChat", swapWhen(false)),
					);
					undoPatches.push(
						Patcher.instead(prototype, "renderCall", swapWhen(true)),
					);
					for (const method of [
						"renderSidebar",
						"renderThreadSidebar",
						"renderEmbeddedActivityPanel",
					]) {
						if (typeof prototype[method] !== "function") continue;
						undoPatches.push(
							Patcher.instead(prototype, method, (self, args, original) =>
								getInformationState(self.props?.channel)
									? null
									: original.apply(self, args),
							),
						);
					}
					undoPatches.push(
						Patcher.before(prototype, "render", (self) => {
							patchToolbar(self);
						}),
					);
					undoPatches.push(patchToolbar(instance));
					if (undoPatches.some((undo) => typeof undo !== "function")) {
						throw new Error(
							"A native channel-view hook could not be installed.",
						);
					}
					channelViewPatched = true;
					return true;
				} catch (error) {
					for (const undo of undoPatches.reverse()) {
						if (typeof undo === "function") undo();
					}
					toolbarPatched.delete(instance);
					if (!captureWarningShown) {
						captureWarningShown = true;
						(__webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js").Logger).warn(
							"Native channel view could not be patched; using the route lockscreen.",
							error,
						);
					}
					return false;
				}
			};

			const captureChannelView = () => {
				if (channelViewPatched) return true;

				for (const sel of [
					'[class*="chatContent"]',
					'[class*="chat_"]',
					'[class*="content_"]',
				]) {
					const node = document.querySelector(sel);
					if (!node) continue;

					let fiber = ReactTools.getInternalInstance(node);
					for (let depth = 0; fiber && depth < 100; depth++) {
						if (fiber.stateNode && patchChannelView(fiber.stateNode))
							return true;
						fiber = fiber.return;
					}
				}

				return false;
			};

			captureChannelView();
			this.captureViewTimeout = setTimeout(captureChannelView, 3000);

			// Fail-safe until all native view hooks have been installed successfully.
			Patcher.after(Route, "A", (_, _args, res) => {
				if (!Voice || !Route || !res?.props) return res;
				if (captureChannelView()) return res;

				const channelId = res.props.computedMatch?.params?.channelId;
				const guildId = res.props.computedMatch?.params?.guildId;
				const channel = ChannelStore?.getChannel(channelId);
				const information = getInformationState(channel);
				if (guildId && information) {
					res.props.render = () =>
						React.createElement(Lockscreen, {
							chat,
							channel,
							settings: this.settings,
							...information,
						});
				}
				return res;
			});

			if (this.settings.hiddenChannelIcon) {
				if (!ChannelItemRenderer) {
					this.api.UI.showToast(
						"(SHC) ChannelItemRenderer module is missing, channel lock icon won't be shown.",
						{
							type: "warning",
						},
					);
				}

				Patcher.after(ChannelItemRenderer, "render", (_, args, res) => {
					const [instance] =
						/** @type {[{channel: SHCChannel, connected: boolean}]} */ (args);
					if (!this.isHiddenChannel(instance?.channel)) {
						return res;
					}

					const item = res?.props?.children?.props;
					if (item?.className) {
						item.className += ` shc-hidden-channel shc-hidden-channel-type-${instance.channel.type}`;
					}

					const children = Utilities.findInTree(
						res,
						(m) =>
							m?.props?.onClick?.toString().includes("stopPropagation") &&
							m.type === "div",
						{
							walkable: ["props", "children", "child", "sibling"],
							maxRecursion: 100,
						},
					);

					if (children.props?.children) {
						children.props.children = [
							React.createElement(HiddenChannelIcon, {
								icon: this.settings.hiddenChannelIcon,
								iconItem: iconItem,
								actionIcon: actionIcon,
							}),
						];
					}

					const isInCallInThisChannel =
						instance.channel.type ===
							DiscordConstants.ChannelTypes.GUILD_VOICE && !instance.connected;
					if (!isInCallInThisChannel) {
						return res;
					}

					const wrapper = Utilities.findInTree(
						res,
						(channel) =>
							channel?.props?.className?.includes("shc-hidden-channel-type-2"),
						{
							walkable: ["props", "children", "child", "sibling"],
							maxRecursion: 100,
						},
					);

					if (!wrapper) {
						return res;
					}

					wrapper.props.onMouseDown = () => {};
					wrapper.props.onMouseUp = () => {};

					const mainContent = wrapper?.props?.children[1]?.props?.children;

					if (!mainContent) {
						return res;
					}

					mainContent.props.onClick = () => {
						if (instance.channel?.isGuildVocal()) {
							NavigationUtils.transitionTo(
								`/channels/${instance.channel.guild_id}/${instance.channel.id}`,
							);
						}
					};
					mainContent.props.href = null;

					return res;
				});
			}

			//* Open SHC's channel information page for visible voice channels
			//* that Discord shows but the current user cannot connect to.
			if (ChannelItemRenderer) {
				Patcher.after(ChannelItemRenderer, "render", (_, args, res) => {
					const [instance] =
						/** @type {[{channel: SHCChannel}]} */ (args);
					const channel = instance?.channel;

					if (
						!channel?.isGuildVocal?.() ||
						this.isHiddenChannel(channel) ||
						this.can(DiscordConstants.Permissions.CONNECT, channel)
					) {
						return res;
					}

					const channelLink = Utilities.findInTree(
						res,
						(node) =>
							node?.props?.["data-list-item-id"] ===
							`channels___${channel.id}`,
						{
							walkable: ["props", "children", "child", "sibling"],
							maxRecursion: 100,
						},
					);

					if (!channelLink?.props) {
						this.warnLockedVoicePatchOnce(
							"locked-voice-channel-link-not-found",
							"Discord's locked voice channel row shape changed; locked voice channels cannot open SHC's channel information page.",
							{ channelId: channel.id, result: res },
						);
						return res;
					}

					channelLink.props.href = null;
					channelLink.props.onMouseDown = (event) => {
						event?.stopPropagation?.();
					};
					channelLink.props.onMouseUp = (event) => {
						event?.stopPropagation?.();
					};
					channelLink.props.onClick = (event) => {
						event?.preventDefault?.();
						event?.stopPropagation?.();
						NavigationUtils.transitionTo(
							`/channels/${channel.guild_id}/${channel.id}`,
						);
					};

					return res;
				});
			}

			//* Manually collapse hidden channel category
			if (!ChannelStore?.getChannel || !GuildChannelStore?.getChannels) {
				this.api.UI.showToast(
					"(SHC) ChannelStore or GuildChannelStore are missing, extra category settings won't work.",
					{
						type: "warning",
					},
				);
			}

			Patcher.after(ChannelStore, "getChannel", (_, args, res) => {
				const [channelId] = /** @type {[string]} */ (args);
				const guild_id = channelId?.replace("_hidden", "");
				const isHiddenCategory = channelId?.endsWith("_hidden");

				if (
					this.settings.sort !== "extra" ||
					!isHiddenCategory ||
					this.settings.blacklistedGuilds[guild_id]
				) {
					return res;
				}

				const HiddenCategoryChannel = createChannelRecord({
					guild_id: guild_id,
					id: channelId,
					name: "Hidden Channels",
					type: DiscordConstants.ChannelTypes.GUILD_CATEGORY,
					permission_overwrites: [],
				});

				return HiddenCategoryChannel;
			});

			Patcher.after(
				ChannelStore,
				"getMutableGuildChannelsForGuild",
				(_, args, GuildChannels) => {
					const [guildId] = /** @type {[string]} */ (args);
					if (!GuildChannelStore?.getChannels) return;

					if (
						this.settings.sort !== "extra" ||
						this.settings.blacklistedGuilds[guildId]
					) {
						return;
					}

					const hiddenCategoryId = `${guildId}_hidden`;
					const HiddenCategoryChannel = createChannelRecord({
						guild_id: guildId,
						id: hiddenCategoryId,
						name: "Hidden Channels",
						type: DiscordConstants.ChannelTypes.GUILD_CATEGORY,
						permission_overwrites: [],
					});

					const GuildCategories =
						GuildChannelStore.getChannels(guildId)[
							DiscordConstants.ChannelTypes.GUILD_CATEGORY
						];
					Object.defineProperty(HiddenCategoryChannel, "position", {
						value:
							(
								GuildCategories[GuildCategories.length - 1] || {
									comparator: 0,
								}
							).comparator + 1,
						writable: true,
					});

					if (!GuildChannels[hiddenCategoryId]) {
						GuildChannels[hiddenCategoryId] = HiddenCategoryChannel;
					}

					return GuildChannels;
				},
			);

			Patcher.after(GuildChannelStore, "getChannels", (_, [guildId], res) => {
				const GuildCategories =
					res[DiscordConstants.ChannelTypes.GUILD_CATEGORY];
				const hiddenCategoryId = `${guildId}_hidden`;
				const hiddenCategory = GuildCategories?.find(
					(m) => m.channel.id === hiddenCategoryId,
				);

				if (!hiddenCategory) return res;

				const OtherCategories = GuildCategories.filter(
					(m) => m.channel.id !== hiddenCategoryId,
				);
				const newComparator =
					(
						OtherCategories[OtherCategories.length - 1] || {
							comparator: 0,
						}
					).comparator + 1;

				Object.defineProperty(hiddenCategory.channel, "position", {
					value: newComparator,
					writable: true,
				});

				Object.defineProperty(hiddenCategory, "comparator", {
					value: newComparator,
					writable: true,
				});

				return res;
			});

			//* Custom category or sorting order
			Patcher.after(ChannelListStore, "getGuild", (_, args, res) => {
				const [guildId] = /** @type {[string]} */ (args);
				if (this.settings.blacklistedGuilds[guildId]) {
					return;
				}

				const guildChannels = res.guildChannels;
				const specialCategories = [
					guildChannels.favoritesCategory,
					guildChannels.recentsCategory,
					guildChannels.noParentCategory,
					guildChannels.voiceChannelsCategory,
				];

				switch (this.settings.sort) {
					case "bottom": {
						for (const category of specialCategories) {
							this.sortChannels(category);
						}

						for (const category of Object.values(guildChannels.categories)) {
							this.sortChannels(category);
						}

						break;
					}

					case "extra": {
						const hiddenCategoryId = `${guildId}_hidden`;
						const HiddenCategory =
							res.guildChannels.categories[hiddenCategoryId];
						const HiddenChannels = this.getHiddenChannelRecord(
							[
								...specialCategories,
								...Object.values(res.guildChannels.categories).filter(
									(category) => category.id !== hiddenCategoryId,
								),
							],
							guildId,
						);

						HiddenCategory.channels = Object.fromEntries(
							Object.entries(HiddenChannels.records).map(([id, channel]) => {
								channel.category = HiddenCategory;
								channel.record.parent_id = hiddenCategoryId;
								return [id, channel];
							}),
						);

						HiddenCategory.isCollapsed =
							res.guildChannels.collapsedCategoryIds[hiddenCategoryId] ??
							CategoryStore.isCollapsed(hiddenCategoryId);
						if (HiddenCategory.isCollapsed) {
							res.guildChannels.collapsedCategoryIds[hiddenCategoryId] = true;
						}

						HiddenCategory.shownChannelIds =
							res.guildChannels.collapsedCategoryIds[hiddenCategoryId] ||
							HiddenCategory.isCollapsed
								? []
								: HiddenChannels.channels
										.sort((x, y) => {
											const xPos = x.position + (x.isGuildVocal() ? 1e4 : 1e5);
											const yPos = y.position + (y.isGuildVocal() ? 1e4 : 1e5);
											return xPos - yPos;
										})
										.map((m) => m.id);
						break;
					}
				}

				if (this.settings.shouldShowEmptyCategory) {
					this.patchEmptyCategoryFunction([
						...Object.values(res.guildChannels.categories).filter(
							(m) => !m.id.includes("hidden"),
						),
					]);
				}

				return res;
			});

			//* add entry in guild context menu
			if (!ContextMenu?.patch) {
				this.api.UI.showToast("(SHC) ContextMenu is missing, skipping.", {
					type: "warning",
				});
			}

			ContextMenu?.patch("guild-context", this.processContextMenu);
		}

		processContextMenu(menu, { guild }) {
			const { ContextMenu } = (__webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js").getModules)();

			const menuCategory = menu?.props?.children?.find((buttonCategory) => {
				const children = buttonCategory?.props?.children;
				return (
					Array.isArray(children) &&
					children.some((button) => button?.props?.id === "hide-muted-channels")
				);
			});

			if (!menuCategory || !guild) return;

			menuCategory.props.children.push(
				ContextMenu.buildItem({
					type: "toggle",
					label: "Disable SHC",
					checked: this.settings.blacklistedGuilds[guild.id],
					action: () => {
						this.settings.blacklistedGuilds[guild.id] =
							!this.settings.blacklistedGuilds[guild.id];
						this.saveSettings();
					},
				}),
			);
		}

		patchEmptyCategoryFunction(categories) {
			for (const category of categories) {
				if (!category.shouldShowEmptyCategory.__originalFunction) {
					category.shouldShowEmptyCategory = () => true;
				}
			}
		}

		sortChannels(category) {
			if (!category || category.isCollapsed) return;

			const channelArray = Object.values(category.channels);

			const calculatePosition = (record) => {
				return (
					record.position +
					(record.isGuildVocal() ? 1000 : 0) +
					(this.isHiddenChannel(record) ? 10000 : 0)
				);
			};

			category.shownChannelIds = channelArray
				.sort((x, y) => {
					const xPos = calculatePosition(x.record);
					const yPos = calculatePosition(y.record);
					return xPos - yPos;
				})
				.map((n) => n.id);
		}

		getHiddenChannelRecord(categories, guildId) {
			const hiddenChannels = this.getHiddenChannels(guildId);
			if (!hiddenChannels) return;

			if (!this.hiddenChannelCache[guildId]) {
				this.hiddenChannelCache[guildId] = [];
			}

			for (const category of categories) {
				const channelRecords = Object.entries(category.channels);
				const filteredChannelRecords = channelRecords.filter(
					([channelID, channelRecord]) => {
						const isHidden = hiddenChannels.channels.some(
							(m) => m.id === channelID,
						);
						if (
							isHidden &&
							!this.hiddenChannelCache[guildId].some((m) => m[0] === channelID)
						) {
							this.hiddenChannelCache[guildId].push([channelID, channelRecord]);
						}
						return !isHidden;
					},
				);
				category.channels = Object.fromEntries(filteredChannelRecords);
				if (category.hiddenChannelIds) {
					category.hiddenChannelIds = category.hiddenChannelIds.filter((v) =>
						filteredChannelRecords.some(([id]) => id === v),
					);
				}

				if (category.shownChannelIds) {
					category.shownChannelIds = category.shownChannelIds.filter((v) =>
						filteredChannelRecords.some(([id]) => id === v),
					);
				}
			}

			return {
				records: Object.fromEntries(this.hiddenChannelCache[guildId]),
				...hiddenChannels,
			};
		}

		/**
		 * Retrieves the hidden channels for a given guild.
		 * @param {string} guildId - The ID of the guild.
		 * @returns {object} - An object containing the hidden channels and the amount of hidden channels.
		 */
		getHiddenChannels(guildId) {
			const { ChannelStore, DiscordConstants } =
				(__webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js").getModules)();

			if (!guildId) {
				return {
					channels: [],
					amount: 0,
				};
			}

			const guildChannels =
				ChannelStore.getMutableGuildChannelsForGuild(guildId);
			const hiddenChannels = Object.values(guildChannels).filter(
				(m) =>
					this.isHiddenChannel(m) &&
					m.type !== DiscordConstants.ChannelTypes.GUILD_CATEGORY,
			);

			const ChannelsAndCount = {
				channels: hiddenChannels,
				amount: hiddenChannels.length,
			};
			return ChannelsAndCount;
		}

		rerenderChannels() {
			const {
				container,
				PermissionStoreActionHandler,
				ChannelListStoreActionHandler,
			} = (__webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js").getModules)();

			PermissionStoreActionHandler?.CONNECTION_OPEN();
			ChannelListStoreActionHandler?.CONNECTION_OPEN();

			this.forceUpdate(document.querySelector(`.${container}`));
		}

		/**
		 * Forces the rerender of a React element.
		 * @param {HTMLElement} element - The element to rerender.
		 * @returns {void}
		 */
		forceUpdate(element) {
			if (!element) return;

			const { ReactTools } = (__webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js").getModules)();

			const toForceUpdate = ReactTools.getOwnerInstance(element);
			const forceRerender = this.api.Patcher.instead(
				toForceUpdate,
				"render",
				() => {
					forceRerender();
					return null;
				},
			);

			toForceUpdate.forceUpdate(() => toForceUpdate.forceUpdate(() => {}));
		}

		stop() {
			const { DOMTools, ContextMenu } = (__webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js").getModules)();
			const { UnloadModules } = __webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js");

			clearTimeout(this.captureViewTimeout);
			this.api.Patcher.unpatchAll();
			DOMTools.removeStyle(config.info.name);
			ContextMenu?.unpatch("guild-context", this.processContextMenu);
			this.rerenderChannels();
			UnloadModules();
		}

		getSettingsPanel() {
			const { Logger, React } = (__webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js").getModules)();
			const { SettingsPanel } = __webpack_require__(/*! ./components/SettingsPanel */ "./src/components/SettingsPanel.jsx");

			return React.createElement(SettingsPanel, {
				settings: this.settings,
				onSettingsChange: (newSetting, value) => {
					this.settings = {
						...this.settings,
						[newSetting]: value,
					};
					Logger.debug(`Setting changed: ${newSetting} => ${value}`);
					this.saveSettings();
				},
			});
		}

		reloadNotification(
			coolText = "Reload Discord to apply changes and avoid bugs",
		) {
			this.api.UI.showConfirmationModal("Reload Discord?", coolText, {
				confirmText: "Reload",
				cancelText: "Later",
				onConfirm: () => {
					window.location.reload();
				},
			});
		}

		saveSettings() {
			const { Logger } = __webpack_require__(/*! ./utils/modules */ "./src/utils/modules.js");

			this.api.Data.save("settings", this.settings);
			Logger.debug("Settings saved.", this.settings);
			this.rerenderChannels();
		}
	};
})());

})();

module.exports = __webpack_exports__["default"];
/******/ })()
;