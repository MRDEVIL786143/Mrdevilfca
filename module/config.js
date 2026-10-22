const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "..", "config.json");
let config = {};

function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
  } catch (e) {
    config = {};
  }
  return { config, path: configPath };
}

function saveConfig(newConfig) {
  try {
    config = { ...config, ...newConfig };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = { loadConfig, saveConfig, getConfig: () => config };
module.exports.credits = "MR DEVIL";
