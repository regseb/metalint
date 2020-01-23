/**
 * @module wrapper/purgecss
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
        "patterns": "*.css",
        "linters":  { "purgecss": { "content": ["*.html", "*.js"] } }
    };
};

/**
 * Vérifie un fichier avec l'utilitaire <strong>PurgeCSS</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @param {object} options Les options qui seront passées au linter.
 * @param {string} root    L’adresse du répertoire où se trouve le dossier
 *                         <code>.metalint/</code>.
 * @returns {Promise.<Array.<object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const wrapper = async function (file, level, options, root) {
    if (SEVERITY.FATAL > level) {
        return [];
    }

    const results = await new PurgeCSS().purge(Object.assign({}, options, {
        // Utiliser le format des patrons de Metalint.
        "content":  glob.walk([], options.content, root),
        "css":      [file],
        "rejected": true
    }));
    if (0 === results.length) {
        return [{
            "file":     file,
            "linter":   "purgecss",
            "severity": SEVERITY.FATAL,
            "message":  "No content provided."
        }];
    }

    return results[0].rejected.map((rejected) => ({
        "file":     file,
        "linter":   "purgecss",
        "severity": SEVERITY.ERROR,
        "message":  `'${rejected}' is never used.`
    })).filter((n) => level >= n.severity);
};

module.exports = { configure, wrapper };
