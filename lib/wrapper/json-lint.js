/* global require, module */

"use strict";

const JSONLint = require("json-lint");
const SEVERITY = require("../severity");

/**
 * Vérifier du code source avec le linter <strong>JSON-Lint</strong>.
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

    const result = JSONLint(source, options);
    if ("error" in result) {
        notices.push({
            "linter":    "json-lint",
            "rule":      null,
            "severity":  SEVERITY.ERROR,
            "message":   result.error,
            "locations": [{ "line":   result.line,
                            "column": result.character }]
        });
    }

    return Promise.resolve(notices);
}; // wrapper()

module.exports = wrapper;
