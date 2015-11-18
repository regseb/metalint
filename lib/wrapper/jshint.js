/* global require, module */

"use strict";

let JSHINT   = require("jshint").JSHINT;
let SEVERITY = require("../severity");

/**
 * Vérifier du code source avec le linter <strong>JSLint</strong>.
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

    JSHINT(source, options);
    for (let result of JSHINT.errors) {
        if (null !== result) {
            notices.push({
                "linter": "jshint",
                "rule": result.code,
                "severity": SEVERITY.ERROR,
                "message": result.reason,
                "locations": [{ "line":   result.line,
                                "column": result.character }]
            });
        }
    }

    return notices;
}; // wrapper()

module.exports = wrapper;
