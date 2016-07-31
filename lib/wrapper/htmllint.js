"use strict";

const fs       = require("fs");
const htmllint = require("htmllint");
const SEVERITY = require("../severity");

/**
 * Vérifier un fichier avec le linter <strong>htmllint</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {Object} options Les options qui seront passées au linter.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @return {Promise.Array.<Object>} Une promesse retournant la liste des
 *                                  notifications.
 */
const wrapper = function (file, options, level) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }

    const source = fs.readFileSync(file, "utf-8");
    return htmllint(source, options).then(function (results) {
        const notices = [];
        for (const result of results) {
            notices.push({
                "linter":    "htmllint",
                "rule":      result.rule,
                "severity":  SEVERITY.ERROR,
                "message":   result.code,
                "locations": [{ "line":   result.line,
                                "column": result.column }]
            });
        }
        return notices;
    });
}; // wrapper()

module.exports = wrapper;
