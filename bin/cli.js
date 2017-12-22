#!/usr/bin/env node

"use strict";

const path  = require("path");
const spawn = require("child_process").spawn;

if (3 <= process.argv.length && "init" === process.argv[2]) {
    spawn(path.join(__dirname, "init.js"),
          process.argv.slice(3),
          { "stdio": "inherit" });
} else {
    spawn(path.join(__dirname, "index.js"),
          process.argv.slice(2),
          { "stdio": "inherit" });
}
