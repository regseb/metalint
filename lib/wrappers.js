/* global require, module */

var wrappers = {
    "csslint":      require("./wrapper/csslint"),
    "eslint":       require("./wrapper/eslint"),
    "jscs":         require("./wrapper/jscs"),
    "jshint":       require("./wrapper/jshint"),
    "jsonlint":     require("./wrapper/jsonlint"),
    "json-lint":    require("./wrapper/json-lint"),
    "markdownlint": require("./wrapper/markdownlint")
};

module.exports = wrappers;
