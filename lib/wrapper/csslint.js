/* global require, module */

"use strict";

const CSSLint  = require("csslint").CSSLint;
const SEVERITY = require("../severity");

/**
 * Vérifier du code source avec le linter <strong>CSSLint</strong>.
 *
 * @param {string} source  Le code source qui sera vérifié.
 * @param {Object} options Les options qui seront passées au linter.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @return {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                    notifications.
 */
const wrapper = function (source, options, level) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }
    const notices = [];

    const results = CSSLint.verify(source, options);
    for (const result of results.messages) {
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
    return Promise.resolve(notices);
}; // wrapper()

module.exports = wrapper;
