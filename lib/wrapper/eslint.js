/* global require, module */

"use strict";

let linter   = require("eslint").linter;
let SEVERITY = require("../severity");

/**
 * Vérifier du code source avec le linter <strong>ESLint</strong>.
 *
 * @param {string} source  Le code source qui sera vérifié.
 * @param {Object} options Les options qui seront passées au linter.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @return {Array<Object>} La liste des notifications.
 */
let wrapper = function (source, options, level) {
    if (SEVERITY.FATAL > level) {
        return [];
    }
    let notices = [];

    let results = linter.verify(source, options);
    for (let result of results) {
        let severity;
        if (result.fatal) {
            severity = SEVERITY.FATAL;
        } else if (1 === result.severity) {
            severity = SEVERITY.WARN;
        } else {
            severity = SEVERITY.ERROR;
        }

        if (level >= severity) {
            notices.push({
                "linter":    "eslint",
                "rule":      result.ruleId,
                "severity":  severity,
                "message":   result.message,
                "locations": [{ "line":   result.line,
                                "column": result.column }]
            });
        }
    }

    return notices;
}; // wrapper()

module.exports = wrapper;
