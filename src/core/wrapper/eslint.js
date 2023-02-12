/**
 * @module
 * @license MIT
 * @see {@link https://www.npmjs.com/package/eslint|ESLint}
 * @author Sébastien Règne
 */

import { ESLint } from "eslint";
import SEVERITY from "../severity.js";

/**
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>ESLint</strong>.
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
    if (SEVERITY.FATAL > level) {
        return [];
    }

    const eslint = new ESLint({
        globInputPaths: false,
        ignore: false,
        baseConfig: options,
        useEslintrc: false,
    });
    const results = await eslint.lintFiles(file);
    return results[0].messages
        .map((result) => {
            let severity;
            if (result.fatal) {
                severity = SEVERITY.FATAL;
            } else if (1 === result.severity) {
                severity = SEVERITY.WARN;
            } else {
                severity = SEVERITY.ERROR;
            }

            return {
                file,
                linter: "eslint",
                ...(null === result.ruleId ? {} : { rule: result.ruleId }),
                severity,
                message: result.message,
                locations: [
                    {
                        line: result.line,
                        column: result.column,
                        ...(undefined === result.endLine
                            ? {}
                            : { endLine: result.endLine }),
                        ...(undefined === result.endColumn
                            ? {}
                            : { endColumn: result.endColumn }),
                    },
                ],
            };
        })
        .filter((n) => level >= n.severity);
};
