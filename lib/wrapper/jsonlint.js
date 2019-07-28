/**
 * @module wrapper/jsonlint
 * @see {@link https://www.npmjs.com/package/jsonlint|JSON Lint}
 */

"use strict";

const fs       = require("fs");
const jsonlint = require("jsonlint");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour JSON Lint.
 *
 * @returns {object} Le patron et les options par défaut.
 */
const configure = function () {
    return {
        "patterns": "*.json",
        "linters":  { "jsonlint": null }
    };
};

/**
 * Vérifie un fichier avec le linter <strong>JSON Lint</strong>.
 *
 * @param {string} file  Le fichier qui sera vérifié.
 * @param {number} level Le niveau de sévérité minimum des notifications
 *                       retournées.
 * @returns {Promise.<Array.<object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const wrapper = function (file, level) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }

    return new Promise(function (resolve) {
        fs.readFile(file, "utf-8", (_, source) => resolve(source));
    }).then(function (source) {
        try {
            jsonlint.parse(source);
            return [];
        } catch (err) {
            const result = err.message.split("\n");

            return [{
                "file":      file,
                "linter":    "jsonlint",
                "message":   result[3],
                // Augmenter de un le numéro de la ligne car JSON Lint commence
                // les numérotations à zéro.
                "locations": [{
                    "line": parseInt(result[0].slice(20, -1), 10) + 1
                }]
            }];
        }
    });
};

module.exports = { configure, wrapper };
