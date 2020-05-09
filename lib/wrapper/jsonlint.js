/**
 * @module
 * @see {@link https://www.npmjs.com/package/jsonlint|JSON Lint}
 */

"use strict";

const fs       = require("fs").promises;
const jsonlint = require("jsonlint");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour JSON Lint.
 *
 * @returns {object} Le patron et les options par défaut.
 */
const configure = function () {
    return {
        patterns: "*.json",
        linters:  { jsonlint: null },
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
const wrapper = async function (file, level) {
    if (SEVERITY.ERROR > level) {
        return [];
    }

    const source = await fs.readFile(file, "utf-8");
    try {
        jsonlint.parse(source);
        return [];
    } catch (err) {
        const result = err.message.split("\n");

        return [{
            file:      file,
            linter:    "jsonlint",
            message:   result[3],
            // Augmenter de un le numéro de la ligne car JSON Lint commence les
            // numérotations à zéro.
            locations: [{
                line: Number.parseInt(result[0].slice(20, -1), 10) + 1,
            }],
        }];
    }
};

module.exports = { configure, wrapper };
