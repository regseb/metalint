/* global require, module */

var jsonlint = require("jsonlint");
var SEVERITY = require("../severity");

var wrapper = function (source, options, level) {
    if (SEVERITY.ERROR > level) {
        return [];
    }
    var notices = [];

    try {
        jsonlint.parse(source);
    } catch (exc) {
        var result = exc.message.split("\n");
        notices.push({
            "linter": "jsonlint",
            "rule": null,
            "severity": SEVERITY.ERROR,
            "message": result[3],
            "locations": [{ "line": parseInt(result[0].slice(20, -1), 10) + 1 }]
        });
    }

    return notices;
}; // wrapper()

module.exports = wrapper;
