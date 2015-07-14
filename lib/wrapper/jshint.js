/* global require, module */

var JSHINT   = require("jshint").JSHINT;
var SEVERITY = require("../severity");

var wrapper = function (source, options, level) {
    if (SEVERITY.ERROR > level) {
        return [];
    }
    var notices = [];

    JSHINT(source, options);
    JSHINT.errors.forEach(function (result) {
        if (null !== result) {
            notices.push({
                "linter": "jshint",
                "rule": result.code,
                "severity": SEVERITY.ERROR,
                "message": result.reason,
                "locations": [{ "line": result.line,
                                "column": result.character }]
            });
        }
    });

    return notices;
}; // wrapper()

module.exports = wrapper;
