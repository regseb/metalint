/**
 * @module
 * @see {@link https://www.npmjs.com/package/standard|JavaScript Standard Style}
 */

import standard from "standard";
import SEVERITY from "../severity.js";

/**
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>JavaScript Standard Style</strong>.
 *
 * @param {string} file  Le fichier qui sera vérifié.
 * @param {number} level Le niveau de sévérité minimum des notifications
 *                       retournées.
 * @returns {Promise<Notice[]>} Une promesse retournant la liste des
 *                              notifications.
 */
export const wrapper = async function (file, level) {
    if (SEVERITY.ERROR > level) {
        return [];
    }

    const results = await new Promise((resolve) => {
        standard.lintFiles([file], (_, r) => resolve(r));
    });
    return results.results[0].messages.map((result) => ({
        file,
        linter:    "standard",
        rule:      result.ruleId,
        message:   result.message,
        locations: [{
            line:   result.line,
            column: result.column,
        }],
    }));
};
