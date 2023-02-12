/**
 * @module
 * @license MIT
 * @see {@link https://www.npmjs.com/package/purgecss|PurgeCSS}
 * @author Sébastien Règne
 */

import { PurgeCSS } from "purgecss";
import glob from "../glob.js";
import SEVERITY from "../severity.js";

/**
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec l'utilitaire <strong>PurgeCSS</strong>.
 *
 * @param {string}           file    Le fichier qui sera vérifié.
 * @param {number}           level   Le niveau de sévérité minimum des
 *                                   notifications retournées.
 * @param {Object|undefined} options Les options qui seront passées au linter ou
 *                                   <code>undefined</code> pour les options par
 *                                   défaut.
 * @param {string}           root    L'adresse du répertoire où se trouve le
 *                                   dossier <code>.metalint/</code>.
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
        content: await glob.walk([], options.content, root),
        css: [file],
        rejected: true,
    });
    if (0 === results.length) {
        return [
            {
                file,
                linter: "purgecss",
                severity: SEVERITY.FATAL,
                message: "No content provided.",
                locations: [],
            },
        ];
    }

    return results[0].rejected
        .map((rejected) => ({
            file,
            linter: "purgecss",
            severity: SEVERITY.ERROR,
            message: `'${rejected}' is never used.`,
            locations: [],
        }))
        .filter((n) => level >= n.severity);
};
