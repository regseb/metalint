/**
 * @module
 * @license MIT
 * @see {@link https://www.npmjs.com/package/prettier|Prettier}
 * @author Sébastien Règne
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
 * @param {string}           file          Le fichier qui sera vérifié.
 * @param {Object|undefined} options       Les options qui seront passées au
 *                                         linter ou <code>undefined</code> pour
 *                                         les options par défaut.
 * @param {Object}           context       Le contexte avec d'autres
 *                                         informations.
 * @param {number}           context.level Le niveau de sévérité minimum des
 *                                         notifications retournées.
 * @param {boolean}          context.fix   La marque indiquant s'il faut
 *                                         corriger le fichier.
 * @returns {Promise<Notice[]>} Une promesse retournant la liste des
 *                              notifications.
 */
export const wrapper = async function (file, options, { level, fix }) {
    if (SEVERITY.FATAL > level) {
        return [];
    }

    const source = await fs.readFile(file, "utf8");
    const config = { filepath: file, ...options };

    try {
        if (fix) {
            const output = prettier.format(source, config);
            if (source !== output) {
                await fs.writeFile(file, output);
            }
            return [];
        }

        const result = prettier.check(source, config);
        if (!result || SEVERITY.ERROR > level) {
            return [
                {
                    file,
                    linter: "prettier",
                    severity: SEVERITY.ERROR,
                    message: "Code style issues found.",
                    locations: [],
                },
            ];
        }
        return [];
    } catch (err) {
        return [
            {
                file,
                linter: "prettier",
                severity: SEVERITY.FATAL,
                message:
                    `${err.name}:` +
                    ` ${err.message.slice(0, err.message.indexOf(" ("))}`,
                locations: [
                    { line: err.loc.start.line, column: err.loc.start.column },
                ],
            },
        ];
    }
};
