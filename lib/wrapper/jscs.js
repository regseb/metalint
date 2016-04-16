/* global Promise, require, module */

"use strict";

const Checker  = require("jscs");
const SEVERITY = require("../severity");

/**
 * Vérifier du code source avec le linter <strong>JSCS</strong>.
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

    const checker = new Checker();
    checker.registerDefaultRules();
    checker.configure(options);

    const results = checker.checkString(source);
    for (const result of results.getErrorList()) {
        notices.push({
            "linter":    "jscs",
            "rule":      result.rule,
            "severity":  SEVERITY.ERROR,
            "message":   result.message.substr(result.message.indexOf(":") + 2),
            "locations": [{ "line": result.line,
                            "column": result.column }]
        });
    }

    return Promise.resolve(notices);
}; // wrapper()

module.exports = wrapper;
