/**
 * @module
 * @see {@link https://www.npmjs.com/package/coffeelint|CoffeeLint}
 */

import { promises as fs } from "fs";
import coffeelint from "coffeelint";
import { SEVERITY } from "../severity.js";

/**
 * @typedef {import("../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>CoffeeLint</strong>.
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
    return coffeelint.lint(source, options)
                     .map((result) => {
        const severity = "warn" === result.level ? SEVERITY.WARN
                                                 : SEVERITY.ERROR;

        return {
            file,
            linter:    "coffeelint",
            rule:      result.rule,
            severity,
            message:   result.message,
            locations: [{ line: result.lineNumber }],
        };
    }).filter((n) => level >= n.severity);
};
