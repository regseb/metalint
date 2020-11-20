/**
 * @module
 * @see {@link https://www.npmjs.com/package/purgecss|PurgeCSS}
 */

import { PurgeCSS } from "purgecss";
import { walk } from "../glob.js";
import { SEVERITY } from "../severity.js";

/**
 * @typedef {import("../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec l'utilitaire <strong>PurgeCSS</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @param {Object} options Les options qui seront passées au linter.
 * @param {string} root    L'adresse du répertoire où se trouve le dossier
 *                         <code>.metalint/</code>.
 * @returns {Promise<Notice[]>} Une promesse retournant la liste des
 *                              notifications.
 */
export const wrapper = async function (file, level, options, root) {
    if (SEVERITY.FATAL > level) {
        return [];
    }

    const results = await new PurgeCSS().purge({
        ...options,
        // Utiliser le format des patrons de Metalint.
        content:  walk([], options.content, root),
        css:      [file],
        rejected: true,
    });
    if (0 === results.length) {
        return [{
            file,
            linter:    "purgecss",
            rule:      null,
            severity:  SEVERITY.FATAL,
            message:   "No content provided.",
            locations: [],
        }];
    }

    return results[0].rejected.map((rejected) => ({
        file,
        linter:    "purgecss",
        rule:      null,
        severity:  SEVERITY.ERROR,
        message:   `'${rejected}' is never used.`,
        locations: [],
    })).filter((n) => level >= n.severity);
};
