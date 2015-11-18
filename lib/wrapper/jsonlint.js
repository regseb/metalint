/* global require, module */

"use strict";

let jsonlint = require("jsonlint");
let SEVERITY = require("../severity");

/**
 * Vérifier du code source avec le linter <strong>JSONLint</strong>.
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

    try {
        jsonlint.parse(source);
    } catch (exc) {
        let result = exc.message.split("\n");
        notices.push({
            "linter":    "jsonlint",
            "rule":      null,
            "severity":  SEVERITY.ERROR,
            "message":   result[3],
            "locations": [{ "line": parseInt(result[0].slice(20, -1), 10) + 1 }]
        });
    }

    return notices;
}; // wrapper()

module.exports = wrapper;
