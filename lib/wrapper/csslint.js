/* global require, module */

var CSSLint  = require("csslint").CSSLint;
var SEVERITY = require("../severity");

var wrapper = function (source, options, level) {
    if (SEVERITY.ERROR > level) {
        return [];
    }
    var notices = [];

    var results = CSSLint.verify(source, options);
    results.messages.forEach(function (result) {
        var severity = "warning" === result.type ? SEVERITY.WARN
                                                 : SEVERITY.ERROR;
        if (level >= severity) {
            notices.push({
                "linter": "csslint",
                "rule": result.rule.id,
                "severity": severity,
                "message": result.message,
                "locations": [{ "line": result.line,
                                "column": result.col }]
            });
        }
    });

    return notices;
}; // wrapper()

module.exports = wrapper;
