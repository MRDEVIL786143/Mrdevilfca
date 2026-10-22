const utils = require("../utils");
const axios = require("axios");
const { getHeaders, getMainHeaders } = require("../src/utils/headers");
const logger = require("../func/logger");
const { getOptions } = require("./options");

const appStatePath = require("../src/utils/cookies").appStatePath;

let api = {};

function loginHelper(appState, Cookie, email, password, globalOptions, callback) {
  let loginDone = false;

  function finish(err, apiData) {
    if (!loginDone) {
      loginDone = true;
      callback(err, apiData);
    }
  }

  async function doLogin() {
    try {
      let cookies = null;

      if (appState) {
        cookies = appState;
      } else if (Cookie) {
        try {
          cookies = JSON.parse(Cookie);
        } catch (e) {
          cookies = [{ key: "cookie", value: Cookie }];
        }
      } else if (email && password) {
        const loginResult = await loginWithCredentials(email, password);
        if (loginResult && loginResult.appState) {
          appStatePath(loginResult.appState);
          cookies = loginResult.appState;
        }
      }

      if (!cookies) {
        return finish({ error: "No valid login credentials provided" });
      }

      const apiInstance = await buildAPI(cookies, globalOptions);
      return finish(null, apiInstance);
    } catch (err) {
      logger(`[RDX-FCA] Login Error: ${err.message}`, "error");
      return finish(err);
    }
  }

  doLogin();
}

async function loginWithCredentials(email, password) {
  const mainHeaders = getMainHeaders();
  const url = "https://www.facebook.com/login/device-based/login/async/";

  const formData = {
    lsd: getLSD(),
    gl: "PK",
    msfos: "1",
    params: JSON.stringify({
      app_id: "256002040743983",
      initial_display_name: email,
      session_key: true
    }),
    email: email,
    password: password,
    login: "Log in"
  };

  try {
    const response = await axios.post(url, new URLSearchParams(formData).toString(), {
      headers: mainHeaders,
      maxRedirects: 0,
      validateStatus: (status) => status < 400 || status === 302
    });

    if (response.headers && response.headers["set-cookie"]) {
      const cookies = parseCookies(response.headers["set-cookie"]);
      const location = response.headers.location;
      if (location) {
        const confirmResponse = await axios.get(location, {
          headers: { ...mainHeaders, Cookie: cookies },
          maxRedirects: 0
        });
        if (confirmResponse.headers && confirmResponse.headers["set-cookie"]) {
          const finalCookies = parseCookies(confirmResponse.headers["set-cookie"]);
          return { appState: finalCookies };
        }
      }
    }
    throw new Error("Login failed");
  } catch (err) {
    throw err;
  }
}

function getLSD() {
  return Math.random().toString(36).substring(7);
}

function parseCookies(setCookie) {
  if (!setCookie) return [];
  if (Array.isArray(setCookie)) {
    return setCookie.map(c => {
      const parts = c.split(";")[0].split("=");
      return { key: parts[0], value: parts[1] };
    });
  }
  return setCookie.split(";").map(c => {
    const parts = c.split("=");
    return { key: parts[0], value: parts[1] };
  });
}

async function buildAPI(cookies, options) {
  api = {
    rdx: true,
    version: "1.0.0",
    owner: "Sardar RDX",
    getCurrentUserID: () => api._userID,
    getAppState: () => api._appState,
    setOptions: (opts) => Object.assign(options, opts),
    getOptions: () => options
  };

  api._appState = cookies;
  api._cookies = cookies;
  api._options = options;

  await loadAllModules(api);

  return api;
}

const path = require("path");
const fs = require("fs");

function tryRequire(filePath) {
  try {
    if (fs.existsSync(filePath + ".js")) return require(filePath);
    return null;
  } catch (e) { return null; }
}

function initModule(handler, api) {
  if (typeof handler === "function") {
    try {
      const result = handler(api);
      if (typeof result === "function" || (result && typeof result === "object")) return result;
      return handler;
    } catch (e) { return handler; }
  }
  return handler;
}

async function loadAllModules(api) {
  const base = path.join(__dirname, "..");
  const searchDirs = [
    path.join(base, "src/api/messaging"),
    path.join(base, "src/api/action"),
    path.join(base, "src/api/users"),
    path.join(base, "src/api/socket"),
    path.join(base, "src/api/http")
  ];

  const moduleNames = [
    "getCurrentUserID", "getUserInfo", "getUserID",
    "sendMessage", "sendTypingIndicator", "setMessageReaction",
    "markAsRead", "markAsDelivered", "getThreadList",
    "getThreadInfo", "getThreadHistory", "getThreadPictures",
    "getFriendsList", "getMessage", "createNewGroup",
    "addUserToGroup", "removeUserFromGroup", "changeThreadColor",
    "changeThreadEmoji", "changeNickname", "setTitle",
    "muteThread", "pinMessage", "deleteThread", "deleteMessage",
    "editMessage", "forwardMessage", "forwardAttachment",
    "handleFriendRequest", "handleMessageRequest", "changeBio",
    "changeAvatar", "changeGroupImage", "changeAdminStatus",
    "changeBlockedStatus", "changeArchivedStatus", "unfriend",
    "logout", "refreshFb_dtsg", "listenMqtt", "stopListenMqtt",
    "unsendMessage", "shareContact", "createPoll", "unblockUser",
    "setMessageReactionMqtt", "connectMqtt"
  ];

  for (const mod of moduleNames) {
    let handler = null;
    for (const dir of searchDirs) {
      handler = tryRequire(path.join(dir, mod));
      if (handler) break;
    }
    if (handler) {
      api[mod] = initModule(handler, api);
    }
  }

  if (!api.listenMqtt || typeof api.listenMqtt !== "function") {
    api.listenMqtt = function(callback) {
      if (typeof callback === "function") {
        api._mqttCallback = callback;
        console.log("[RDX-FCA] listenMqtt: using fallback listener");
      }
      return { on: () => {}, removeAllListeners: () => {} };
    };
  }

  if (!api.stopListenMqtt) {
    api.stopListenMqtt = function() { api._mqttCallback = null; };
  }

  if (!api.getCurrentUserID || typeof api.getCurrentUserID !== "function") {
    api.getCurrentUserID = () => api._userID || "0";
  }

  if (!api.setOptions) {
    api.setOptions = (opts) => Object.assign(api._options || {}, opts);
  }

  if (!api.unblockUser) {
    api.unblockUser = function(uid, cb) { if (cb) cb(null); };
  }

  if (!api.unsendMessage) {
    api.unsendMessage = function(msgID, cb) { if (cb) cb(null); };
  }

  if (!api.shareContact) {
    api.shareContact = function(msg, uid, tid, cb, replyID) { if (cb) cb(null, {}); };
  }

  if (!api.editMessage) {
    api.editMessage = function(text, msgID, cb) { if (cb) cb(null); };
  }
}

module.exports = loginHelper;
module.exports.credits = "MR DEVIL";
