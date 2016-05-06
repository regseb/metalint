"use strict";

const jsonlint = require("jsonlint");
const SEVERITY = require("../severity");

/**
 * Vérifier du code source avec le linter <strong>JSONLint</strong>.
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

    try {
        jsonlint.parse(source);
    } catch (exc) {
        const result = exc.message.split("\n");
        notices.push({
            "linter":    "jsonlint",
            "rule":      null,
            "severity":  SEVERITY.ERROR,
            "message":   result[3],
            "locations": [{ "line": parseInt(result[0].slice(20, -1), 10) + 1 }]
        });
    }

    return Promise.resolve(notices);
}; // wrapper()

module.exports = wrapper;
