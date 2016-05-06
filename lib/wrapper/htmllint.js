"use strict";

const htmllint = require("htmllint");
const SEVERITY = require("../severity");

/**
 * Vérifier du code source avec le linter <strong>htmllint</strong>.
 *
 * @param {string} source  Le code source qui sera vérifié.
 * @param {Object} options Les options qui seront passées au linter.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @return {Promise.Array.<Object>} Une promesse retournant la liste des
 *                                  notifications.
 */
const wrapper = function (source, options, level) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }

    return htmllint(source, options).then(function (results) {
        const notices = [];
        for (const result of results) {
            notices.push({
                "linter":    "htmllint",
                "rule":      result.rule,
                "severity":  SEVERITY.ERROR,
                "message":   result.code,
                "locations": [{ "line":   result.line,
                                "column": result.column }]
            });
        }
        return notices;
    });
}; // wrapper()

module.exports = wrapper;
