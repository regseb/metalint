/**
 * @module
 * @see {@link https://www.npmjs.com/package/prettier|Prettier}
 */

import fs from "node:fs/promises";
import prettier from "prettier";
import SEVERITY from "../severity.js";

/**
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec l'utilitaire <strong>Prettier</strong>.
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
    const result = prettier.check(source, { filepath: file, ...options });
    return result ? []
                  : [{
        file,
        linter:    "prettier",
        severity:  SEVERITY.ERROR,
        message:   "Code style issues found.",
        locations: [],
    }];
};
