/* global require, module */

"use strict";

/**
 * La liste des linters (enrobés dans une fonction normalisée).
 */
const wrappers = {
    "csslint":      require("./wrapper/csslint"),
    "eslint":       require("./wrapper/eslint"),
    "html5-lint":   require("./wrapper/html5-lint"),
    "htmlhint":     require("./wrapper/htmlhint"),
    "htmllint":     require("./wrapper/htmllint"),
    "jscs":         require("./wrapper/jscs"),
    "jshint":       require("./wrapper/jshint"),
    "json-lint":    require("./wrapper/json-lint"),
    "jsonlint":     require("./wrapper/jsonlint"),
    "markdownlint": require("./wrapper/markdownlint")
};

// Exposer la liste des linters.
module.exports = wrappers;
