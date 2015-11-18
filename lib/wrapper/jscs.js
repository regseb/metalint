/* global require, module */

"use strict";

let Checker  = require("jscs");
let SEVERITY = require("../severity");

/**
 * Vérifier du code source avec le linter <strong>JSCS</strong>.
 *
 * @param {string} source  Le code source qui sera vérifié.
 * @param {Object} options Les options qui seront passées au linter.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @return {Array<Object>} La liste des notifications.
 */
let wrapper = function (source, options, level) {
    if (SEVERITY.ERROR > level) {
        return [];
    }
    let notices = [];

    let checker = new Checker();
    checker.registerDefaultRules();
    checker.configure(options);

    let results = checker.checkString(source);
    for (let result of results.getErrorList()) {
        notices.push({
            "linter": "jscs",
            "rule": null,
            "severity": SEVERITY.ERROR,
            "message": result.message + ".",
            "locations": [{ "line": result.line,
                            "column": result.column }]
        });
    }

    return notices;
}; // wrapper()

module.exports = wrapper;
