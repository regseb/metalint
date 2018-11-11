/**
 * @module wrapper/stylelint
 * @see {@link https://www.npmjs.com/package/stylelint|stylelint}
 */

"use strict";

const fs        = require("fs");
const stylelint = require("stylelint");
const SEVERITY  = require("../severity");

/**
 * Initialise un checker pour stylelint en cherchant l'éventuelle configuration.
 *
 * @returns {Object} Le patron et les options par défaut.
 */
const configure = function () {
    let config = { "rules": {} };
    for (const file of fs.readdirSync(".")) {
        if ([".stylelintrc", ".stylelintrc.json"].includes(file)) {
            config = "../" + file;
            break;
        }
    }
    return {
        "patterns": "*.css",
        "linters":  { "stylelint": config }
    };
};

/**
 * Vérifie un fichier avec le linter <strong>stylelint</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @param {Object} options Les options qui seront passées au linter.
 * @returns {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const wrapper = function (file, level, options) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }

    const config = {
        "config":                options,
        "files":                 file,
        "disableDefaultIgnores": true
    };
    return stylelint.lint(config).then(function (results) {
        const notices = [];

        for (const result of results.results[0].warnings) {
            const severity = "warning" === result.severity ? SEVERITY.WARN
                                                           : SEVERITY.ERROR;
            if (level >= severity) {
                const message = result.text.substring(0,
                                    result.text.lastIndexOf(" ("));
                notices.push({
                    "file":      file,
                    "linter":    "stylelint",
                    "rule":      result.rule,
                    "severity":  severity,
                    "message":   message,
                    "locations": [{ "line":   result.line,
                                    "column": result.column }]
                });
            }
        }
        return notices;
    });
};

module.exports = { configure, wrapper };
