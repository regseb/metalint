/**
 * @module
 * @see {@link https://www.npmjs.com/package/htmlhint|HTMLHint}
 */

import { promises as fs } from "fs";
import { HTMLHint } from "htmlhint";
import { SEVERITY } from "../severity.js";

/**
 * @typedef {import("../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>HTMLHint</strong>.
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

    const source = await fs.readFile(file, "utf-8");
    const results = HTMLHint.verify(source, null === options ? undefined
                                                             : options);
    return results.map((result) => {
        const severity = "warning" === result.type ? SEVERITY.WARN
                                                   : SEVERITY.ERROR;
        return {
            file,
            linter:    "htmlhint",
            rule:      result.rule.id,
            severity,
            message:   result.message,
            locations: [{
                line:   result.line,
                column: result.col,
            }],
        };
    }).filter((n) => level >= n.severity);
};
