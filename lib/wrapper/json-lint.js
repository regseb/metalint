/**
 * @module
 * @see {@link https://www.npmjs.com/package/json-lint|JSON-Lint}
 */

"use strict";

const fs       = require("fs").promises;
const jsonlint = require("json-lint");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour JSON-Lint.
 *
 * @returns {object} Le patron et les options par défaut.
 */
const configure = function () {
    return {
        patterns: "*.json",
        linters:  { "json-lint": null },
    };
};

/**
 * Vérifie un fichier avec le linter <strong>JSON-Lint</strong>.
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
    const result = jsonlint(source, options);
    if ("error" in result) {
        return [{
            file:      file,
            linter:    "json-lint",
            message:   result.error,
            locations: [{
                line:   result.line,
                column: result.character,
            }],
        }];
    }

    return [];
};

module.exports = { configure, wrapper };
