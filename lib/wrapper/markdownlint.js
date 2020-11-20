/**
 * @module
 * @see {@link https://www.npmjs.com/package/markdownlint|Markdownlint}
 */

import markdownlint from "markdownlint";
import { SEVERITY } from "../severity.js";

/**
 * @typedef {import("../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>MarkdownLint</strong>.
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
        files:  file,
        config: options,
    };
    const results = await new Promise((resolve) => {
        markdownlint(config, (_, r) => resolve(r));
    });
    if ("" === results.toString()) {
        return [];
    }

    return results.toString().split("\n")
                             .map((result) => {
        const parts = result.match(/[^ ]+ (\d+): ([^ ]+) (.*)/u);

        return {
            file,
            linter:    "markdownlint",
            rule:      parts[2],
            severity:  SEVERITY.ERROR,
            message:   parts[3],
            locations: [{ line: Number.parseInt(parts[1], 10) }],
        };
    });
};
