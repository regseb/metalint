/**
 * @module wrapper/lesshint
 */

"use strict";

const fs       = require("fs");
const Lesshint = require("lesshint").Lesshint;
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour lesshint en cherchant l'éventuelle configuration.
 *
 * @returns {Object} Les patrons et les options par défaut.
 */
const configure = function () {
    let config = null;
    for (const file of fs.readdirSync(".")) {
        if ([".lesshintrc.json", ".lesshintrc"].includes(file)) {
            config = "../" + file;
            break;
        }
    }
    return {
        "patterns": "*.less",
        "linters":  { "lesshint": config }
    };
};

/**
 * Vérifie un fichier avec le linter <strong>lesshint</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @param {Object} options Les options qui seront passées au linter.
 * @returns {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const wrapper = function (file, level, options) {
    if (SEVERITY.FATAL > level) {
        return Promise.resolve([]);
    }

    const lesshint = new Lesshint();
    lesshint.configure(options);
    return lesshint.checkFiles(file).then(function (results) {
        return results.map(function (result) {
            let rule;
            let severity;
            if ("parse error" === result.linter) {
                rule = "parseError";
                severity = SEVERITY.FATAL;
            } else {
                rule = result.linter;
                severity = "warning" === result.severity ? SEVERITY.WARN
                                                         : SEVERITY.ERROR;
            }

            return {
                "linter":    "lesshint",
                "rule":      rule,
                "severity":  severity,
                "message":   result.message,
                "locations": [{ "line":   result.line,
                                "column": result.column }]
            };
        }).filter((n) => level >= n.severity);
    });
};

module.exports = { configure, wrapper };
