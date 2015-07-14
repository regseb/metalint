/* global require, module */

var Checker  = require("jscs");
var SEVERITY = require("../severity");

var wrapper = function (source, options, level) {
    if (SEVERITY.ERROR > level) {
        return [];
    }
    var notices = [];

    var checker = new Checker();
    checker.registerDefaultRules();
    checker.configure(options);

    var results = checker.checkString(source);
    results.getErrorList().forEach(function (result) {
        notices.push({
            "linter": "jscs",
            "rule": null,
            "severity": SEVERITY.ERROR,
            "message": result.message + ".",
            "locations": [{ "line": result.line,
                            "column": result.column }]
        });
    });

    return notices;
}; // wrapper()

module.exports = wrapper;
