/* global require, module */

"use strict";

const JSHINT   = require("jshint").JSHINT;
const SEVERITY = require("../severity");

/**
 * Vérifier du code source avec le linter <strong>JSHint</strong>.
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

    JSHINT(source, options);
    for (const result of JSHINT.errors) {
        if (null === result) {
            continue;
        }
        notices.push({
            "linter":    "jshint",
            "rule":      result.code,
            "severity":  SEVERITY.ERROR,
            "message":   result.reason,
            "locations": [{ "line":   result.line,
                            "column": result.character }]
        });
    }

    return Promise.resolve(notices);
}; // wrapper()

module.exports = wrapper;
