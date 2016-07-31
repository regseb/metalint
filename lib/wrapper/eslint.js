"use strict";

const fs       = require("fs");
const linter   = require("eslint").linter;
const SEVERITY = require("../severity");

/**
 * Vérifier un fichier avec le linter <strong>ESLint</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {Object} options Les options qui seront passées au linter.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @return {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                    notifications.
 */
const wrapper = function (file, options, level) {
    if (SEVERITY.FATAL > level) {
        return Promise.resolve([]);
    }
    const notices = [];

    const results = linter.verify(fs.readFileSync(file, "utf-8"), options);
    for (const result of results) {
        let severity;
        if (result.fatal) {
            severity = SEVERITY.FATAL;
        } else if (1 === result.severity) {
            severity = SEVERITY.WARN;
        } else {
            severity = SEVERITY.ERROR;
        }

        if (level >= severity) {
            notices.push({
                "linter":    "eslint",
                "rule":      result.ruleId,
                "severity":  severity,
                "message":   result.message,
                "locations": [{ "line":   result.line,
                                "column": result.column }]
            });
        }
    }
    return Promise.resolve(notices);
}; // wrapper()

module.exports = wrapper;
