/* global require, module */

var linter   = require("eslint").linter;
var SEVERITY = require("../severity");

var wrapper = function (source, options, level) {
    if (SEVERITY.FATAL > level) {
        return [];
    }
    var notices = [];

    var results = linter.verify(source, options);
    results.forEach(function (result) {
        var severity;
        if (result.fatal) {
            severity = SEVERITY.FATAL;
        } else if (1 === result.severity) {
            severity = SEVERITY.WARN;
        } else {
            severity = SEVERITY.ERROR;
        }
        notices.push({
            "linter": "eslint",
            "rule": result.ruleId,
            "severity": severity,
            "message": result.message,
            "locations": [{ "line": result.line,
                            "column": result.column }]
        });
    });

    return notices;
}; // wrapper()

module.exports = wrapper;
