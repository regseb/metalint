/**
 * @module
 * @see {@link https://www.npmjs.com/package/htmllint|htmllint}
 */

import { promises as fs } from "fs";
import htmllint from "htmllint";
import { SEVERITY } from "../severity.js";

/**
 * @typedef {import("../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>htmllint</strong>.
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
    const results = await htmllint(source, options);
    return results.map((result) => ({
        file,
        linter:    "htmllint",
        rule:      result.rule,
        message:   result.code,
        locations: [{
            line:   result.line,
            column: result.column,
        }],
    }));
};
