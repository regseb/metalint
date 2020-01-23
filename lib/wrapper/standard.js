/**
 * @module
 * @see {@link https://www.npmjs.com/package/standard|JavaScript Standard Style}
 */

"use strict";

const standard = require("standard");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour JavaScript Standard Style.
 *
 * @returns {object} Le patron et les options par défaut.
 */
const configure = function () {
    return {
        "patterns": "*.js",
        "linters":  { "standard": null }
    };
};

/**
 * Vérifie un fichier avec le linter <strong>JavaScript Standard Style</strong>.
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

    const results = await new Promise((resolve) => {
        standard.lintFiles([file], (_, r) => resolve(r));
    });
    return results.results[0].messages.map((result) => ({
        "file":      file,
        "linter":    "standard",
        "rule":      result.ruleId,
        "message":   result.message,
        "locations": [{
            "line":   result.line,
            "column": result.column
        }]
    }));
};

module.exports = { configure, wrapper };
