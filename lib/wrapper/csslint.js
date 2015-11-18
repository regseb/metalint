/* global require, module */

"use strict";

let CSSLint  = require("csslint").CSSLint;
let SEVERITY = require("../severity");

/**
 * Vérifier du code source avec le linter <strong>CSSLint</strong>.
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

    let results = CSSLint.verify(source, options);
    for (let result of results.messages) {
        let severity;
        switch (result.type) {
            case "info":    severity = SEVERITY.INFO;  break;
            case "warning": severity = SEVERITY.WARN;  break;
            case "error":   severity = SEVERITY.ERROR; break;
            default:        severity = SEVERITY.FATAL;
        }

        let locations;
        if ("line" in result) {
            locations = [{ "line":   result.line,
                           "column": result.col }];
        } else {
            locations = null;
        }

        if (level >= severity) {
            notices.push({
                "linter":   "csslint",
                "rule":      result.rule.id,
                "severity":  severity,
                "message":   result.message,
                "locations": locations
            });
        }
    }

    return notices;
}; // wrapper()

module.exports = wrapper;
