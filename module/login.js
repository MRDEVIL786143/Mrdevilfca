const { getType } = require('../src/utils/format');
const { setOptions } = require('../src/func/utils');
const { loadConfig } = require('./config');
const { checkAndUpdateVersion } = require('../src/func/version');
const loginHelper = require('../src/func/loginHelper');
const logger = require('../func/logger');

function normalizeLoginData(inputData) {
    if (!inputData) return { 'appState': null, 'Cookie': null, 'email': null, 'password': null };
    
    let appState = null, cookie = null, email = null, password = null;
    
    if (Array.isArray(inputData)) {
        appState = inputData;
    } else {
        if (typeof inputData === 'object') {
            if (inputData.appState) {
                appState = inputData.appState;
            } else if (inputData.Cookie) {
                if (typeof inputData.Cookie === 'string') {
                    try {
                        cookie = JSON.parse(inputData.Cookie);
                    } catch {
                        cookie = parseCookieString(inputData.Cookie);
                    }
                } else {
                    cookie = inputData.Cookie;
                }
            } else if (inputData.email && inputData.password) {
                email = inputData.email;
                password = inputData.password;
            } else if (inputData.cookies) {
                appState = inputData.cookies;
            } else if (inputData.cookie) {
                if (typeof inputData.cookie === 'string') {
                    cookie = parseCookieString(inputData.cookie);
                } else {
                    cookie = inputData.cookie;
                }
            }
        } else if (typeof inputData === 'string') {
            try {
                appState = JSON.parse(inputData);
            } catch {
                cookie = parseCookieString(inputData);
            }
        }
    }
    return { 'appState': appState, 'Cookie': cookie, 'email': email, 'password': password };
}

function parseCookieString(cookieString) {
    return cookieString.split(';').map(item => {
        const parts = item.trim().split('=');
        return { 'key': parts[0], 'value': parts[1] || '' };
    }).filter(cookie => cookie.key);
}

const { config } = loadConfig();

global.devilFca = { 'config': config };

if (!global.devilFca['_errorHandlersInstalled']) {
    global.devilFca['_errorHandlersInstalled'] = true;

    process.on('unhandledRejection', (reason, promise) => {
        try {
            if (reason && typeof reason === 'object') {
                const errCode = reason.code || reason.errno?.['code'];
                const errMsg = reason.message || String(reason);

                if (errMsg.includes('aborted')) return;

                if (errCode === 'ETIMEDOUT' || errCode === 'ECONNRESET' || errMsg.includes('socket') || errMsg.includes('network')) {
                    logger('[DEVIL-FCA] Network warning: ' + errMsg, 'warn');
                    return;
                }
                if (errCode === 'ENOTFOUND' || errCode === 'EAI_AGAIN' || errCode === 'ECONNREFUSED' || errMsg.includes('ECONNREFUSED') || errMsg.includes('fetch failed')) {
                    logger('[DEVIL-FCA] Connection error: ' + errMsg, 'error');
                    return;
                }
            }
            logger('[DEVIL-FCA] Unhandled promise rejection (non-fatal): ' + (reason && reason.message ? reason.message : String(reason)), 'error');
        } catch (err) {}
    });

    process.on('uncaughtException', err => {
        try {
            const errMsg = err.message || String(err);
            const errCode = err.code;

            if (errMsg.includes('aborted')) return;
            if (errCode === 'ETIMEDOUT' || errCode === 'ETIMEDOUT' || errMsg.includes('socket') || errMsg.includes('fetch failed')) {
                logger('[DEVIL-FCA] Uncaught exception warning: ' + errMsg, 'warn');
                return;
            }
            logger('[DEVIL-FCA] Uncaught exception error: ' + errMsg, 'error');
        } catch (e) {}
    });
}

function login(loginData, options, callback) {
    if (getType(options) === 'Function' || getType(options) === 'AsyncFunction') {
        callback = options;
        options = {};
    }

    const defaultOptions = {
        'selfListen': false,
        'selfListenEvent': false,
        'listenEvents': false,
        'listenTyping': false,
        'updatePresence': false,
        'forceLogin': false,
        'autoMarkRead': false,
        'autoReconnect': true,
        'online': true,
        'emitReady': false,
        'userAgent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    };

    setOptions(defaultOptions, options);

    let promiseResolve = null, promiseReject = null, promiseObject = null, callbackWrapper = null;

    if (getType(callback) !== 'Function' && getType(callback) !== 'AsyncFunction') {
        promiseObject = new Promise(function(resolve, reject) {
            promiseResolve = resolve;
            promiseReject = reject;
        });
        callbackWrapper = function(err, api) {
            if (err) return promiseReject(err);
            return promiseResolve(api);
        };
        callback = callbackWrapper;
    }

    const normalizedData = normalizeLoginData(loginData);
    const executeLogin = () => loginHelper(
        normalizedData.Cookie, 
        normalizedData.appState, 
        normalizedData.email, 
        normalizedData.password, 
        defaultOptions, 
        callback, 
        callbackWrapper
    );

    if (config && config.checkVersion) {
        const versionCheck = checkAndUpdateVersion();
        versionCheck && typeof versionCheck.then === 'function' 
            ? versionCheck.then(executeLogin).catch(err => callback(err)) 
            : executeLogin();
    } else {
        executeLogin();
    }

    return promiseObject;
}

module.exports = login;
module.exports.credits = 'DEVIL FCA';
