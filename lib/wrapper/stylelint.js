"use strict";

const stylelint = require("stylelint");
const SEVERITY  = require("../severity");

/**
 * Vérifier du code source avec le linter <strong>stylelint</strong>.
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

    const config = {
        "code":   source,
        "config": options
    };
    return stylelint.lint(config).then(function ({ results }) {
        const notices = [];

        for (const result of results[0].warnings) {
            const severity = "warning" === result.severity ? SEVERITY.WARN
                                                           : SEVERITY.ERROR;
            if (level >= severity) {
                const message = result.text.substring(0,
                                    result.text.lastIndexOf(" ("));
                notices.push({
                    "linter":    "stylelint",
                    "rule":      result.rule,
                    "severity":  severity,
                    "message":   message,
                    "locations": [{ "line":   result.line,
                                    "column": result.column }]
                });
            }
        }
        return notices;
    });
}; // wrapper()

module.exports = wrapper;
