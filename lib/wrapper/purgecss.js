/**
 * @module
 * @see {@link https://www.npmjs.com/package/purgecss|PurgeCSS}
 */

"use strict";

const PurgeCSS = require("purgecss").default;
const glob     = require("../glob");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour PurgeCSS.
 *
 * @returns {object} Le patron et les options par défaut.
 */
const configure = function () {
    return {
        patterns: "*.css",
        linters:  { purgecss: { content: ["*.html", "*.js"] } },
    };
};

/**
 * Compile une expression rationnelle.
 *
 * @param {string} regex Une chaine de caractères contenant l'expression
 *                       rationnelle.
 * @returns {RegExp} L'expression rationnelle.
 */
const compile = function (regex) {
    const result = (/^\/(.*)\/([gimuys]*)$/u).exec(regex);
    return new RegExp(result[1], result[2]);
};

/**
 * Vérifie un fichier avec l'utilitaire <strong>PurgeCSS</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @param {object} options Les options qui seront passées au linter.
 * @param {string} root    L'adresse du répertoire où se trouve le dossier
 *                         <code>.metalint/</code>.
 * @returns {Promise.<Array.<object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const wrapper = async function (file, level, options, root) {
    if (SEVERITY.FATAL > level) {
        return [];
    }

    const results = await new PurgeCSS().purge({
        ...options,
        // Utiliser le format des patrons de Metalint.
        content:                   glob.walk([], options.content, root),
        css:                       [file],
        rejected:                  true,
        whitelistPatterns:         "whitelistPatterns" in options
                                        ? options.whitelistPatterns.map(compile)
                                        : [],
        whitelistPatternsChildren: "whitelistPatternsChildren" in options
                                ? options.whitelistPatternsChildren.map(compile)
                                : [],
    });
    if (0 === results.length) {
        return [{
            file,
            linter:   "purgecss",
            severity: SEVERITY.FATAL,
            message:  "No content provided.",
        }];
    }

    return results[0].rejected.map((rejected) => ({
        file,
        linter:   "purgecss",
        severity: SEVERITY.ERROR,
        message:  `'${rejected}' is never used.`,
    })).filter((n) => level >= n.severity);
};

module.exports = { configure, wrapper };
