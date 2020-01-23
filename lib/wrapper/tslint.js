/**
 * @module
 * @see {@link https://www.npmjs.com/package/tslint|TSLint}
 */

"use strict";

const fs          = require("fs").promises;
const readdirSync = require("fs").readdirSync;
const tslint      = require("tslint");
const SEVERITY    = require("../severity");

/**
 * Initialise un checker pour TSLint en cherchant l'éventuelle configuration.
 *
 * @returns {object} Le patron et les options par défaut.
 */
const configure = function () {
    let config = {};
    for (const file of readdirSync(".")) {
        if ("tslint.json" === file) {
            config = "../" + file;
            break;
        }
    }
    return {
        "patterns": "*.ts",
        "linters":  { "tslint": config }
    };
};

/**
 * Vérifie un fichier avec le linter <strong>TSLint</strong>.
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
    const configuration = tslint.Configuration.parseConfigFile(options);
    const linter = new tslint.Linter({ "fix": false });
    linter.lint(file, source, configuration);
    return linter.getResult().failures
                 .map((result) => {
        const severity = "warning" === result.getRuleSeverity()
                                                               ? SEVERITY.WARN
                                                               : SEVERITY.ERROR;
        const start = result.getStartPosition().getLineAndCharacter();
        const end   = result.getEndPosition().getLineAndCharacter();

        return {
            "file":      file,
            "linter":    "tslint",
            "rule":      result.getRuleName(),
            "severity":  severity,
            "message":   result.getFailure(),
            "locations": [{
                // Augmenter de un le numéro de la ligne et de la colonne
                // car TSLint commence les numérotations à zéro.
                "line":      start.line + 1,
                "column":    start.character + 1,
                "lineEnd":   end.line + 1,
                "columnEnd": end.character + 1
            }]
        };
    }).filter((n) => level >= n.severity);
};

module.exports = { configure, wrapper };
