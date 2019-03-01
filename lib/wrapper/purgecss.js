/**
 * @module wrapper/purgecss
 * @see {@link https://www.npmjs.com/package/purgecss|Purgecss}
 */

"use strict";

const PurgeCss = require("purgecss");
const glob     = require("../glob");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour Purgecss.
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
 * Vérifie un fichier avec l'utilitaire <strong>Purgecss</strong>.
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
const wrapper = function (file, level, options, root) {
    if (SEVERITY.FATAL > level) {
        return Promise.resolve([]);
    }

    try {
        const purgeCss = new PurgeCss(Object.assign({}, options, {
            // Utiliser le format des patrons de Metalint.
            "content":  glob.walk([], options.content, root),
            "css":      [file],
            "rejected": true
        }));
        const results = purgeCss.purge();
        return Promise.resolve(results[0].rejected.map(function (result) {
            return {
                "file":     file,
                "linter":   "purgecss",
                "severity": SEVERITY.ERROR,
                "message":  `'${result}' is never used.`
            };
        }).filter((n) => level >= n.severity));
    } catch (err) {
        return Promise.resolve([{
            "file":     file,
            "linter":   "purgecss",
            "severity": SEVERITY.FATAL,
            "message":  err.message
        }]);
    }
};

module.exports = { configure, wrapper };
