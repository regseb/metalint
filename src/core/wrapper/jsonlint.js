/**
 * @module
 * @see {@link https://www.npmjs.com/package/jsonlint|JSON Lint}
 */

import fs from "node:fs/promises";
import jsonlint from "jsonlint";
import SEVERITY from "../severity.js";

/**
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>JSON Lint</strong>.
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

    const source = await fs.readFile(file, "utf8");
    try {
        jsonlint.parse(source);
        return [];
    } catch (err) {
        const result = err.message.split("\n");

        return [{
            file,
            linter:    "jsonlint",
            rule:      null,
            severity:  SEVERITY.ERROR,
            message:   result[3],
            // Augmenter de un le numéro de la ligne car JSON Lint commence les
            // numérotations à zéro.
            locations: [{
                line: Number.parseInt(result[0].slice(20, -1), 10) + 1,
            }],
        }];
    }
};
