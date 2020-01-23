/**
 * @module
 * @see {@link https://www.npmjs.com/package/stylelint|stylelint}
 */

"use strict";

const fs        = require("fs");
const stylelint = require("stylelint");
const SEVERITY  = require("../severity");

/**
 * Initialise un checker pour stylelint en cherchant l'éventuelle configuration.
 *
 * @returns {object} Le patron et les options par défaut.
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
 * @param {object} options Les options qui seront passées au linter.
 * @returns {Promise.<Array.<object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const wrapper = async function (file, level, options) {
    if (SEVERITY.ERROR > level) {
        return [];
    }

    const config = {
        "config":                options,
        "files":                 file,
        "disableDefaultIgnores": true
    };
    const results = await stylelint.lint(config);
    return results.results[0].warnings.map((result) => {
        const severity = "warning" === result.severity ? SEVERITY.WARN
                                                       : SEVERITY.ERROR;
        const message = result.text.slice(0, result.text.lastIndexOf(" ("));
        return {
            "file":      file,
            "linter":    "stylelint",
            "rule":      result.rule,
            "severity":  severity,
            "message":   message,
            "locations": [{
                "line":   result.line,
                "column": result.column
            }]
        };
    }).filter((n) => level >= n.severity);
};

module.exports = { configure, wrapper };
