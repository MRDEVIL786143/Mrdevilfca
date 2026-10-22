const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "..", "logs");
const logFile = path.join(logDir, "rdx-fca.log");

function ensureLogDir() {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

function formatLog(level, message, data = null) {
  const timestamp = new Date().toISOString();
  let logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (data) {
    logEntry += ` | Data: ${JSON.stringify(data)}`;
  }
  return logEntry;
}

function writeLog(level, message, data = null) {
  try {
    ensureLogDir();
    const logEntry = formatLog(level, message, data) + "\n";
    fs.appendFileSync(logFile, logEntry);
  } catch (err) {
    console.error("[RDX-FCA] Log write error:", err.message);
  }
}

const logAdapter = {
  info: (message, data) => writeLog("info", message, data),
  warn: (message, data) => writeLog("warn", message, data),
  error: (message, data) => writeLog("error", message, data),
  debug: (message, data) => writeLog("debug", message, data),
  
  getLogs: (limit = 100) => {
    try {
      if (!fs.existsSync(logFile)) return [];
      const logs = fs.readFileSync(logFile, "utf8").split("\n").filter(Boolean);
      return logs.slice(-limit);
    } catch (err) {
      return [];
    }
  },
  
  clearLogs: () => {
    try {
      if (fs.existsSync(logFile)) {
        fs.unlinkSync(logFile);
      }
      return true;
    } catch (err) {
      return false;
    }
  }
};

module.exports = logAdapter;
module.exports.credits = "MR DEVIL";
