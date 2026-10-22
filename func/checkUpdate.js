const axios = require("axios");
const chalk = require("chalk");

const currentVersion = "1.0.0";
const packageName = "DEVIL-FCA";
const githubRepo = "mrdevil/DEVIL-FCA";

const banner = (text) => chalk.cyan(text);

function checkAndUpdateVersion() {
  return new Promise((resolve) => {
    console.log(banner(`
╔═══════════════════════════════════════════════════╗
║      DEVIL-FCA v${currentVersion} - MR DEVIL               ║
║      Combined Best Features | Enhanced API       ║
╚═══════════════════════════════════════════════════╝
    `));
    console.log(chalk.cyan(`[DEVIL-FCA] Checking for updates...`));
    
    axios.get(`https://registry.npmjs.org/${packageName}/latest`)
      .then(response => {
        const latestVersion = response.data.version;
        if (latestVersion > currentVersion) {
          console.log(chalk.yellow(`[DEVIL-FCA] New version available: ${latestVersion}`));
          console.log(chalk.cyan(`[DEVIL-FCA] Run: npm install ${packageName}@latest`));
        } else {
          console.log(chalk.green(`[DEVIL-FCA] You are using the latest version!`));
        }
      })
      .catch(() => {
        // Silent fail for update check
      })
      .finally(() => {
        resolve(true);
      });
  });
}

module.exports = { checkAndUpdateVersion, currentVersion };
module.exports.credits = "MR DEVIL";
