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
 * @returns {Object} Le patron et les options par défaut.
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
 * @returns {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const wrapper = function (file, level) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }
    const notices = [];

    const source = fs.readFileSync(file, "utf-8");
    try {
        jsonlint.parse(source);
    } catch (err) {
        const result = err.message.split("\n");
        notices.push({
            "file":      file,
            "linter":    "jsonlint",
            "message":   result[3],
            "locations": [{ "line": parseInt(result[0].slice(20, -1), 10) + 1 }]
        });
    }

    return Promise.resolve(notices);
};

module.exports = { configure, wrapper };
