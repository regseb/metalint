/**
 * @module
 * @see {@link https://www.npmjs.com/package/yaml-lint|YAML Lint}
 */

import yamlLint from "yaml-lint";
import { SEVERITY } from "../severity.js";

/**
 * @typedef {import("../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>YAML Lint</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @param {Object} options Les options qui seront passées au linter.
 * @returns {Promise<Notice[]>} Une promesse retournant la liste des
 *                              notifications.
 */
export const wrapper = async function (file, level, options) {
    if (SEVERITY.ERROR > level) {
        return [];
    }

    try {
        await yamlLint.lintFile(file, options);
        return [];
    } catch (err) {
        return [{
            file,
            linter:    "yaml-lint",
            rule:      null,
            severity:  SEVERITY.ERROR,
            message:   err.reason,
            locations: [{
                // Augmenter de un le numéro de la ligne et de la colonne car
                // YAML Lint commence les numérotations à zéro.
                line:   err.mark.line + 1,
                column: err.mark.column + 1,
            }],
        }];
    }
};
