/**
 * @module
 * @see {@link https://www.npmjs.com/package/stylelint|stylelint}
 */

import stylelint from "stylelint";
import { SEVERITY } from "../severity.js";

/**
 * @typedef {import("../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>stylelint</strong>.
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

    const config = {
        config:                null === options ? { rules: {} }
                                                : options,
        files:                 file,
        disableDefaultIgnores: true,
    };
    const results = await stylelint.lint(config);
    return results.results[0].warnings.map((result) => {
        const severity = "warning" === result.severity ? SEVERITY.WARN
                                                       : SEVERITY.ERROR;
        const message = result.text.slice(0, result.text.lastIndexOf(" ("));
        return {
            file,
            linter:    "stylelint",
            rule:      result.rule,
            severity,
            message,
            locations: [{
                line:   result.line,
                column: result.column,
            }],
        };
    }).filter((n) => level >= n.severity);
};
