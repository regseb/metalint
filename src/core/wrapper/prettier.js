/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import prettier from "prettier";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

/**
 * @typedef {import("../../type/index.d.ts").Level} Level
 * @typedef {import("../../type/index.d.ts").PartialNotice} PartialNotice
 */

/**
 * L'enrobage du linter <strong>Prettier</strong>.
 *
 * @see https://www.npmjs.com/package/prettier
 */
export default class PrettierWrapper extends Wrapper {
    /**
     * Les options du linter.
     *
     * @type {Record<string, any>}
     * @see https://prettier.io/docs/en/options.html
     */
    #options;

    /**
     * Crée un enrobage pour l'utilitaire <strong>Prettier</strong>.
     *
     * @param {Object}              context       Le contexte de l'enrobage.
     * @param {Level}               context.level Le niveau de sévérité minimum
     *                                            des notifications retournées.
     * @param {boolean}             context.fix   La marque indiquant s'il faut
     *                                            corriger le fichier.
     * @param {string}              context.root  L'adresse du répertoire où se
     *                                            trouve le répertoire
     *                                            <code>.metalint/</code>.
     * @param {string[]}            context.files La liste de tous les fichiers
     *                                            analysés.
     * @param {Record<string, any>} options       Les options du linter.
     */
    constructor(context, options) {
        super(context);
        this.#options = options;
    }

    /**
     * Vérifie un fichier.
     *
     * @param {string} file Le fichier qui sera vérifié.
     * @returns {Promise<PartialNotice[]>} Une promesse retournant la liste des
     *                                     notifications.
     */
    async lint(file) {
        if (Levels.FATAL > this.level) {
            return [];
        }

        const source = await fs.readFile(file, "utf8");
        const config = { ...this.#options, filepath: file };

        try {
            if (this.fix) {
                const output = prettier.format(source, config);
                if (source !== output) {
                    await fs.writeFile(file, output);
                }
                return [];
            }

            const result = prettier.check(source, config);
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
            if ("UndefinedParserError" === err.constructor.name) {
                return [
                    {
                        file,
                        linter: "prettier",
                        severity: Severities.FATAL,
                        message: err.message.replace(/: .*$/u, "."),
                    },
                ];
            }
            if ("SyntaxError" === err.name) {
                return [
                    {
                        file,
                        linter: "prettier",
                        severity: Severities.FATAL,
                        message: err.message.slice(
                            0,
                            err.message.indexOf(" ("),
                        ),
                        locations: [
                            {
                                line: err.loc.start.line,
                                column: err.loc.start.column,
                            },
                        ],
                    },
                ];
            }
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
