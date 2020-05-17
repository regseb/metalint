/**
 * @module
 * @see {@link https://www.npmjs.com/package/coffeelint|CoffeeLint}
 */

"use strict";

const fs          = require("fs").promises;
const readdirSync = require("fs").readdirSync;
const coffeelint  = require("coffeelint");
const SEVERITY    = require("../severity");

/**
 * Initialise un checker pour CoffeeLint en cherchant l'éventuelle
 * configuration.
 *
 * @returns {object} Le patron et les options par défaut.
 */
const configure = function () {
    let config = null;
    for (const file of readdirSync(".")) {
        if ("coffeelint.json" === file) {
            config = "../" + file;
            break;
        }
    }
    return {
        patterns: "*.coffee",
        linters:  { coffeelint: config },
    };
};

/**
 * Vérifie un fichier avec le linter <strong>CoffeeLint</strong>.
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
    return coffeelint.lint(source, options)
                     .map((result) => {
        const severity = "warn" === result.level ? SEVERITY.WARN
                                                 : SEVERITY.ERROR;

        return {
            file,
            linter:    "coffeelint",
            rule:      result.rule,
            severity,
            message:   result.message,
            locations: [{ line: result.lineNumber }],
        };
    }).filter((n) => level >= n.severity);
};

module.exports = { configure, wrapper };
