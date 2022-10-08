/**
 * @module
 * @see {@link https://www.npmjs.com/package/@linthtml/linthtml|LintHTML}
 */

import fs from "node:fs/promises";
import LintHTML from "@linthtml/linthtml";
import SEVERITY from "../severity.js";

// Corriger l'export par défaut qui est cassé dans le linter.
// https://github.com/linthtml/linthtml/issues/471
const linthtml = LintHTML.default;

/**
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>LintHTML</strong>.
 *
 * @param {string}           file    Le fichier qui sera vérifié.
 * @param {number}           level   Le niveau de sévérité minimum des
 *                                   notifications retournées.
 * @param {Object|undefined} options Les options qui seront passées au linter ou
 *                                   <code>undefined</code> pour les options par
 *                                   défaut.
 * @returns {Promise<Notice[]>} Une promesse retournant la liste des
 *                              notifications.
 */
export const wrapper = async function (file, level, options) {
    if (SEVERITY.ERROR > level) {
        return [];
    }

    const source = await fs.readFile(file, "utf8");
    const results = await linthtml(source, options);
    return results.map((result) => ({
        file,
        linter:    "linthtml",
        rule:      result.rule,
        severity:  "warning" === result.severity ? SEVERITY.WARN
                                                 : SEVERITY.ERROR,
        message:   result.code,
        locations: [{
            line:      result.position.start.line,
            column:    result.position.start.column,
            endLine:   result.position.end.line,
            endColumn: result.position.end.column,
        }],
    })).filter((n) => level >= n.severity);
};
