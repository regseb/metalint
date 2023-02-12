/* eslint-disable max-len */
/**
 * @module
 * @license MIT
 * @see {@link https://www.npmjs.com/package/npm-package-json-lint|npm-package-json-lint}
 * @author Sébastien Règne
 */
/* eslint-enable max-len */

import fs from "node:fs/promises";
import { NpmPackageJsonLint } from "npm-package-json-lint";
import SEVERITY from "../severity.js";

/**
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>npm-package-json-lint</strong>.
 *
 * @param {string}           file          Le fichier qui sera vérifié.
 * @param {Object|undefined} options       Les options qui seront passées au
 *                                         linter ou <code>undefined</code> pour
 *                                         les options par défaut.
 * @param {Object}           context       Le contexte avec d'autres
 *                                         informations.
 * @param {number}           context.level Le niveau de sévérité minimum des
 *                                         notifications retournées.
 * @returns {Promise<Notice[]>} Une promesse retournant la liste des
 *                              notifications.
 */
export const wrapper = async function (file, options, { level }) {
    if (SEVERITY.ERROR > level) {
        return [];
    }

    const source = await fs.readFile(file, "utf8");
    const npmPackageJsonLint = new NpmPackageJsonLint({
        packageJsonObject: JSON.parse(source),
        packageJsonFilePath: file,
        config: options,
    });
    const results = npmPackageJsonLint.lint();
    return results.results[0].issues
        .map((result) => ({
            file,
            linter: "npm-package-json-lint",
            rule: result.lintId,
            severity:
                "warning" === result.severity ? SEVERITY.WARN : SEVERITY.ERROR,
            message: result.lintMessage,
            locations: [],
        }))
        .filter((n) => level >= n.severity);
};
