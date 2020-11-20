/**
 * @module
 * @see {@link https://www.npmjs.com/package/jshint|JSHint}
 */

import { promises as fs } from "fs";
import { JSHINT as jshint } from "jshint";
import { SEVERITY } from "../severity.js";

/**
 * @typedef {import("../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>JSHint</strong>.
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
    jshint(source, options);
    return jshint.errors.map((result) => ({
        file,
        linter:    "jshint",
        rule:      result.code,
        severity:  result.code.startsWith("W") ? SEVERITY.WARN
                                               : SEVERITY.ERROR,
        message:   result.reason,
        locations: [{
            line:   result.line,
            column: result.character,
        }],
    })).filter((n) => level >= n.severity);
};
