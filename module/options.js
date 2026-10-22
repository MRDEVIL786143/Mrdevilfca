const fs = require("fs");
const path = require("path");

let globalOptions = {};

function getOptions() {
  return globalOptions;
}

function setOptions(defaults, options) {
  if (typeof options === "undefined") {
    globalOptions = defaults;
  } else {
    for (const key in defaults) {
      if (typeof options[key] === "undefined") {
        globalOptions[key] = defaults[key];
      } else {
        globalOptions[key] = options[key];
      }
    }
  }
  return globalOptions;
}

module.exports = {
  getOptions,
  setOptions
};
module.exports.credits = "MR DEVIL";
