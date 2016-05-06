"use strict";

const standard = require("standard");
const SEVERITY = require("../severity");

/**
 * Vérifier du code source avec le linter
 * <strong>JavaScript Standard Style</strong>.
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

    return new Promise(function (resolve) {
        standard.lintText(source, function (_, results) {
            const notices = [];
            for (const result of results.results[0].messages) {
                notices.push({
                    "linter":    "standard",
                    "rule":      result.ruleId,
                    "severity":  SEVERITY.ERROR,
                    "message":   result.message,
                    "locations": [{ "line":   result.line,
                                    "column": result.column }]
                });
            }
            resolve(notices);
        });
    });
}; // wrapper()

module.exports = wrapper;
