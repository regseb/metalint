/**
 * @module
 * @see {@link https://www.npmjs.com/package/htmllint|htmllint}
 */

"use strict";

const fs          = require("fs").promises;
const readdirSync = require("fs").readdirSync;
const htmllint    = require("htmllint");
const SEVERITY    = require("../severity");

/**
 * Initialise un checker pour htmllint en cherchant l'éventuelle configuration.
 *
 * @returns {object} Le patron et les options par défaut.
 */
const configure = function () {
    let config = null;
    for (const file of readdirSync(".")) {
        if (".htmllintrc" === file) {
            config = "../" + file;
            break;
        }
    }
    return {
        patterns: "*.html",
        linters:  { htmllint: config },
    };
};

/**
 * Vérifie un fichier avec le linter <strong>htmllint</strong>.
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
    const results = await htmllint(source, options);
    return results.map((result) => ({
        file:      file,
        linter:    "htmllint",
        rule:      result.rule,
        message:   result.code,
        locations: [{
            line:   result.line,
            column: result.column,
        }],
    }));
};

module.exports = { configure, wrapper };
