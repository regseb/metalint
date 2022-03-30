/**
 * @module
 * @see {@link https://www.npmjs.com/package/json-lint|JSON-Lint}
 */

import fs from "node:fs/promises";
import jsonlint from "json-lint";
import SEVERITY from "../severity.js";

/**
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>JSON-Lint</strong>.
 *
 * @param {string}  file    Le fichier qui sera vérifié.
 * @param {number}  level   Le niveau de sévérité minimum des notifications
 *                          retournées.
 * @param {?Object} options Les options qui seront passées au linter ou
 *                          <code>null</code> pour les options par défaut.
 * @returns {Promise<Notice[]>} Une promesse retournant la liste des
 *                              notifications.
 */
export const wrapper = async function (file, level, options) {
    if (SEVERITY.ERROR > level) {
        return [];
    }

    const source = await fs.readFile(file, "utf8");
    const result = jsonlint(source, options);
    if ("error" in result) {
        return [{
            file,
            linter:    "json-lint",
            rule:      null,
            severity:  SEVERITY.ERROR,
            message:   result.error,
            locations: [{
                line:   result.line,
                column: result.character,
            }],
        }];
    }

    return [];
};
