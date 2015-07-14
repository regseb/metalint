/* global require, module */

var JSONLint = require("json-lint");
var SEVERITY = require("../severity");

var wrapper = function (source, options, level) {
    if (SEVERITY.ERROR > level) {
        return [];
    }
    var notices = [];

    var result = JSONLint(source, options);
    if ("error" in result) {
        notices.push({
            "linter": "json-lint",
            "rule": null,
            "severity": SEVERITY.ERROR,
            "message": result.error,
            "locations": [{ "line": result.line,
                            "column": result.character }]
        });
    }

    return notices;
}; // wrapper()

module.exports = wrapper;
