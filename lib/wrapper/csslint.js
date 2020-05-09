/**
 * @module
 * @see {@link https://www.npmjs.com/package/csslint|CSSLint}
 */

"use strict";

const fs          = require("fs").promises;
const readdirSync = require("fs").readdirSync;
const CSSLint     = require("csslint").CSSLint;
const SEVERITY    = require("../severity");

/**
 * Initialise un checker pour CSSLint en cherchant l'éventuelle configuration.
 *
 * @returns {object} Le patron et les options par défaut.
 */
const configure = function () {
    let config = null;
    for (const file of readdirSync(".")) {
        if (".csslintrc" === file) {
            config = "../" + file;
            break;
        }
    }
    return {
        patterns: "*.css",
        linters:  { csslint: config },
    };
};

/**
 * Vérifie un fichier avec le linter <strong>CSSLint</strong>.
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

    const source = await fs.readFile(file, "utf-8");
    return CSSLint.verify(source, options).messages
                  .map((result) => {
        const severity = "warning" === result.type ? SEVERITY.WARN
                                                   : SEVERITY.ERROR;

        return {
            file:      file,
            linter:    "csslint",
            rule:      result.rule.id,
            severity:  severity,
            message:   result.message,
            locations: [{
                line:   result.line,
                column: result.col,
            }],
        };
    }).filter((n) => level >= n.severity);
};

module.exports = { configure, wrapper };
