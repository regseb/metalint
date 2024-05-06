/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import { ESLint } from "eslint";
// Désactiver la règle suivante pour cet import, car elle ne supporte pas la
// propriété "exports" du package.json.
// https://github.com/import-js/eslint-plugin-import/issues/1810
// eslint-disable-next-line import/no-unresolved
import pkg from "eslint/use-at-your-own-risk";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

const { FlatESLint } = pkg;

/**
 * @typedef {import("../results.js").PartialNotice} PartialNotice
 * @typedef {import("../levels.js").Level} Level
 */

/**
 * L'enrobage du linter <strong>ESLint</strong>.
 *
 * @see https://www.npmjs.com/package/eslint
 */
export default class ESLintWrapper extends Wrapper {
    /**
     * L'instance de ESLint.
     *
     * @type {ESLint}
     * @see https://eslint.org/docs/latest/integrate/nodejs-api
     */
    #eslint;

    /**
     * Crée un enrobage pour le linter <strong>ESLint</strong>.
     *
     * @param {Object}                  context       Le contexte de l'enrobage.
     * @param {Level}                   context.level Le niveau de sévérité
     *                                                minimum des notifications
     *                                                retournées.
     * @param {boolean}                 context.fix   La marque indiquant s'il
     *                                                faut corriger le fichier.
     * @param {string}                  context.root  L'adresse du répertoire où
     *                                                se trouve le répertoire
     *                                                <code>.metalint/</code>.
     * @param {string[]}                context.files La liste de tous les
     *                                                fichiers analysés.
     * @param {Record<string, unknown>} options       Les options du linter.
     */
    constructor(context, options) {
        super(context);
        const { configType, ...baseConfig } = options;
        if ("flat" === configType) {
            this.#eslint = new FlatESLint({
                globInputPaths: false,
                ignore: false,
                baseConfig,
                fix: this.fix,
                overrideConfigFile: true,
            });
        } else {
            this.#eslint = new ESLint({
                globInputPaths: false,
                ignore: false,
                baseConfig,
                useEslintrc: false,
                fix: this.fix,
            });
        }
    }

    /**
     * Vérifie un fichier.
     *
     * @param {string} file Le fichier qui sera vérifié.
     * @returns {Promise<PartialNotice[]>} Une promesse retournant la liste des
     *                                     notifications.
     */
    async lint(file) {
        if (Levels.FATAL > this.level && !this.fix) {
            return [];
        }

        const [results] = await this.#eslint.lintFiles(file);

        if (undefined !== results.output) {
            await fs.writeFile(file, results.output);
        }

        return results.messages
            .map((result) => {
                let severity;
                if (result.fatal) {
                    severity = Severities.FATAL;
                } else if (1 === result.severity) {
                    severity = Severities.WARN;
                } else {
                    severity = Severities.ERROR;
                }

                return {
                    file,
                    linter: "eslint",
                    rule: result.ruleId ?? undefined,
                    severity,
                    message: result.message,
                    locations: [
                        {
                            line: result.line,
                            column: result.column,
                            endLine: result.endLine,
                            endColumn: result.endColumn,
                        },
                    ],
                };
            })
            .filter((n) => this.level >= n.severity);
    }
}
