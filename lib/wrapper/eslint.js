/* global require, module */

"use strict";

const linter   = require("eslint").linter;
const SEVERITY = require("../severity");

/**
 * Vérifier du code source avec le linter <strong>ESLint</strong>.
 *
 * @param {string} source  Le code source qui sera vérifié.
 * @param {Object} options Les options qui seront passées au linter.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @return {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                    notifications.
 */
const wrapper = function (source, options, level) {
    if (SEVERITY.FATAL > level) {
        return Promise.resolve([]);
    }
    const notices = [];

    const results = linter.verify(source, options);
    for (const result of results) {
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
                // FIXME Supprimer cette condition quand la version 2.0.0
                //       de ESLint sera utilisée :
                //       https://github.com/eslint/eslint/issues/4722
                "rule":      ("ruleId" in result ? result.ruleId : null),
                "severity":  severity,
                "message":   result.message,
                "locations": [{ "line":   result.line,
                                "column": result.column }]
            });
        }
    }
    return Promise.resolve(notices);
}; // wrapper()

module.exports = wrapper;
