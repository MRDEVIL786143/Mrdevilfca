
const chalk = require("chalk");

const RDX = (text) => text;

function logger(message, type = "info") {
  const timestamp = new Date().toLocaleString();
  const prefix = "[DEVIL-FCA]";

  switch (type) {
    case "error":
      console.log(chalk.red(`${prefix} [${timestamp}] ❌ ERROR: ${message}`));
      break;
    case "warn":
      console.log(chalk.yellow(`${prefix} [${timestamp}] ⚠️  WARNING: ${message}`));
      break;
    case "success":
      console.log(chalk.green(`${prefix} [${timestamp}] ✅ SUCCESS: ${message}`));
      break;
    case "info":
    default:
      console.log(chalk.blue(`${prefix} [${timestamp}] ℹ️  INFO: ${message}`));
  }
}

module.exports = logger;
module.exports.credits = "MR DEVIL";
