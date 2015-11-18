/* global require, module */

"use strict";

/**
 * La liste des linters (enrobés dans une fonction normalisée)..
 */
let wrappers = {
    "csslint":      require("./wrapper/csslint"),
    "eslint":       require("./wrapper/eslint"),
    "jscs":         require("./wrapper/jscs"),
    "jshint":       require("./wrapper/jshint"),
    "json-lint":    require("./wrapper/json-lint"),
    "jsonlint":     require("./wrapper/jsonlint"),
    "markdownlint": require("./wrapper/markdownlint")
};

// Exposer la liste des linters.
module.exports = wrappers;
