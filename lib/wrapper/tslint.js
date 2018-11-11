/**
 * @module wrapper/tslint
 * @see {@link https://www.npmjs.com/package/tslint|TSLint}
 */

"use strict";

const fs       = require("fs");
const tslint   = require("tslint");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour TSLint en cherchant l'éventuelle configuration.
 *
 * @returns {Object} Le patron et les options par défaut.
 */
const configure = function () {
    let config = {};
    for (const file of fs.readdirSync(".")) {
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
 * @param {Object} options Les options qui seront passées au linter.
 * @returns {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const wrapper = function (file, level, options) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }

    return new Promise(function (resolve) {
        fs.readFile(file, "utf-8", (_, data) => resolve(data));
    }).then(function (data) {
        const configuration = tslint.Configuration.parseConfigFile(options);
        const linter = new tslint.Linter({});
        linter.lint(file, data, configuration);
        return linter.getResult().failures.map(function (result) {
            const severity = "warning" === result.ruleSeverity ? SEVERITY.WARN
                                                               : SEVERITY.ERROR;

            const start = result.startPosition.lineAndCharacter;
            const end   = result.endPosition.lineAndCharacter;
            const locations = [];
            if (start.line === end.line) {
                for (let i = start.character; i <= end.character; ++i) {
                    // Augmenter de un le numéro de la ligne et de la colonne
                    // car TSLint commence les numérotations à zéro.
                    locations.push({
                        "line":   start.line + 1,
                        "column": i + 1
                    });
                }
            } else {
                // Augmenter de un le numéro de la ligne et de la colonne car
                // TSLint commence les numérotations à zéro.
                locations.push({
                    "line":   start.line + 1,
                    "column": start.character + 1
                });
            }

            return {
                "file":      file,
                "linter":    "tslint",
                "rule":      result.ruleName,
                "severity":  severity,
                "message":   result.failure,
                "locations": locations
            };
        }).filter((n) => level >= n.severity);
    });
};

module.exports = { configure, wrapper };
