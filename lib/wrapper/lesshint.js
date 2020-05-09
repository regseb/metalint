/**
 * @module
 * @see {@link https://www.npmjs.com/package/lesshint|lesshint}
 */

"use strict";

const fs       = require("fs");
const Lesshint = require("lesshint").Lesshint;
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour lesshint en cherchant l'éventuelle configuration.
 *
 * @returns {object} Le patron et les options par défaut.
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
        patterns: "*.less",
        linters:  { lesshint: config },
    };
};

/**
 * Vérifie un fichier avec le linter <strong>lesshint</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @param {object} options Les options qui seront passées au linter.
 * @returns {Promise.<Array.<object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const wrapper = async function (file, level, options) {
    if (SEVERITY.FATAL > level) {
        return [];
    }

    const lesshint = new Lesshint();
    lesshint.configure(options);
    const results = await lesshint.checkFiles(file);
    return results.map((result) => {
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
            file:      file,
            linter:    "lesshint",
            rule:      rule,
            severity:  severity,
            message:   result.message,
            locations: [{
                line:   result.line,
                column: result.column,
            }],
        };
    }).filter((n) => level >= n.severity);
};

module.exports = { configure, wrapper };
