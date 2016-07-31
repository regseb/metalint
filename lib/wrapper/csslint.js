"use strict";

const fs       = require("fs");
const CSSLint  = require("csslint").CSSLint;
const SEVERITY = require("../severity");

/**
 * Vérifier un fichier avec le linter <strong>CSSLint</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {Object} options Les options qui seront passées au linter.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @return {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                    notifications.
 */
const wrapper = function (file, options, level) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }
    const notices = [];

    const results = CSSLint.verify(fs.readFileSync(file, "utf-8"), options);
    for (const result of results.messages) {
        const severity = "warning" === result.type ? SEVERITY.WARN
                                                   : SEVERITY.ERROR;
        if (level >= severity) {
            notices.push({
                "linter":    "csslint",
                "rule":      result.rule.id,
                "severity":  severity,
                "message":   result.message,
                "locations": [{ "line":   result.line,
                                "column": result.col }]
            });
        }
    }
    return Promise.resolve(notices);
}; // wrapper()

module.exports = wrapper;
