/* global require, module */

"use strict";

const HTMLHint = require("htmlhint").HTMLHint;
const SEVERITY = require("../severity");

/**
 * Vérifier du code source avec le linter <strong>HTMLHint</strong>.
 *
 * @param {string} source  Le code source qui sera vérifié.
 * @param {Object} options Les options qui seront passées au linter.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @return {Promise.Array.<Object>} Une promesse retournant la liste des
 *                                  notifications.
 */
const wrapper = function (source, options, level) {
    if (SEVERITY.WARN > level) {
        return Promise.resolve([]);
    }
    const notices = [];

    const results = HTMLHint.verify(source, null !== options ? options
                                                             : undefined);
    for (const result of results) {
        notices.push({
            "linter":    "htmlhint",
            "rule":      result.rule.id,
            "severity":  "warn" === result.type ? SEVERITY.WARN
                                                : SEVERITY.ERROR,
            "message":   result.message,
            "locations": [{ "line":   result.line,
                            "column": result.col }]
        });
    }
    return Promise.resolve(notices);
}; // wrapper()

module.exports = wrapper;
