/**
 * @module wrapper/yaml-lint
 * @see {@link https://www.npmjs.com/package/yaml-lint|YAML Lint}
 */

"use strict";

const fs       = require("fs");
const yamlLint = require("yaml-lint");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour YAML Lint en cherchant l'éventuelle configuration.
 *
 * @returns {object} Les patrons et les options par défaut.
 */
const configure = function () {
    let config = null;
    for (const file of fs.readdirSync(".")) {
        if (".yaml-lint.json" === file) {
            config = "../" + file;
            break;
        }
    }
    return {
        "patterns": ["*.yaml", "*.yml"],
        "linters":  { "yaml-lint": config }
    };
};

/**
 * Vérifie un fichier avec le linter <strong>YAML Lint</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @param {object} options Les options qui seront passées au linter.
 * @returns {Promise.<Array.<object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const wrapper = function (file, level, options) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }

    return yamlLint.lintFile(file, options).then(function () {
        return [];
    }).catch(function (err) {
        return [{
            "file":      file,
            "linter":    "yaml-lint",
            "message":   err.reason,
            "locations": [{
                // Augmenter de un le numéro de la ligne et de la colonne car
                // YAML Lint commence les numérotations à zéro.
                "line":   err.mark.line + 1,
                "column": err.mark.column + 1
            }]
        }];
    });
};

module.exports = { configure, wrapper };
