/* global require, module, __dirname */

"use strict";

const spawnSync = require("child_process").spawnSync;
const LINTERS   = require("../package.json").linterDependencies;

const lazy = function (module) {
    try {
        return require(module);
    } catch (exc) {
        spawnSync("npm", ["install", module + "@" + LINTERS[module]],
                  { "cwd": __dirname, "stdio": "inherit" });
        return require(module);
    }
}; // lazy()

module.exports = lazy;
