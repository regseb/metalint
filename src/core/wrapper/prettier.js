/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import * as prettier from "prettier";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

/**
 * @import { PartialNotice } from "../results.js"
 * @import { Level } from "../levels.js"
 */

/**
 * L'enrobage du linter **Prettier**.
 *
 * @see https://www.npmjs.com/package/prettier
 */
export default class PrettierWrapper extends Wrapper {
    /**
     * La marque indiquant que le linter est configurable.
     *
     * @type {boolean}
     */
    static configurable = true;

    /**
     * Les options du linter.
     *
     * @type {Record<string, unknown>}
     * @see https://prettier.io/docs/en/options.html
     */
    #options;

    /**
     * Crée un enrobage pour le linter **Prettier**.
     *
     * @param {Object}                  context       Le contexte de l'enrobage.
     * @param {Level}                   context.level Le niveau de sévérité
     *                                                minimum des notifications
     *                                                retournées.
     * @param {boolean}                 context.fix   La marque indiquant s'il
     *                                                faut corriger le fichier.
     * @param {string}                  context.root  L'adresse du répertoire où
     *                                                se trouve le répertoire
     *                                                `.metalint/`.
     * @param {string[]}                context.files La liste de tous les
     *                                                fichiers analysés.
     * @param {Record<string, unknown>} options       Les options du linter.
     */
    constructor(context, options) {
        super(context);
        this.#options = options;
    }

    /**
     * Analyse un fichier.
     *
     * @param {string} file Le fichier qui sera analysé.
     * @returns {Promise<PartialNotice[]>} Une promesse retournant la liste des
     *                                     notifications.
     */
    async lint(file) {
        if (Levels.FATAL > this.level && !this.fix) {
            return [];
        }

        const source = await fs.readFile(file, "utf8");
        const config = { ...this.#options, filepath: file };

        try {
            if (this.fix) {
                const output = await prettier.format(source, config);
                if (source !== output) {
                    await fs.writeFile(file, output);
                }
                return [];
            }

            const result = await prettier.check(source, config);
            if (result || Levels.ERROR > this.level) {
                return [];
            }

            return [
                {
                    file,
                    linter: "prettier",
                    message: "Code style issues found.",
                },
            ];
        } catch (err) {
            switch (err.name) {
                case "SyntaxError":
                    return [
                        {
                            file,
                            linter: "prettier",
                            severity: Severities.FATAL,
                            message: err.message.replace(
                                / \(\d+:\d+\)\n.*/su,
                                "",
                            ),
                            locations: [
                                {
                                    line: err.loc.start.line,
                                    column: err.loc.start.column,
                                },
                            ],
                        },
                    ];
                default:
                    return [
                        {
                            file,
                            linter: "prettier",
                            severity: Severities.FATAL,
                            message: err.message,
                        },
                    ];
            }
        }
    }
}
