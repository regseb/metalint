/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import process from "node:process";
import { runSecretLint } from "secretlint";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

/**
 * @import { Level } from "../levels.js"
 * @import { PartialNotice } from "../results.js"
 */

/**
 * L'enrobage du linter **Secretlint**.
 *
 * @see https://www.npmjs.com/package/secretlint
 */
export default class SecretlintWrapper extends Wrapper {
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
     * @see https://github.com/secretlint/secretlint#configuration
     */
    #options;

    /**
     * Crée un enrobage pour le linter **Secretlint**.
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
        if (Levels.FATAL > this.level) {
            return [];
        }

        try {
            const results = await runSecretLint({
                cliOptions: {
                    cwd: process.cwd(),
                    filePathOrGlobList: [file],
                },
                engineOptions: {
                    formatter: "json",
                    configFileJSON: this.#options,
                },
            });

            const stdout = JSON.parse(results.stdout);
            return stdout[0].messages
                .map((result) => {
                    let severity;
                    switch (result.severity) {
                        case "info":
                            severity = Severities.INFO;
                            break;
                        case "warning":
                            severity = Severities.WARN;
                            break;
                        default:
                            severity = Severities.ERROR;
                            break;
                    }

                    return {
                        file,
                        linter: "secretlint",
                        rule: result.messageId,
                        message: result.message,
                        severity,
                        locations: [
                            {
                                line: result.loc.start.line,
                                // Augmenter de un le numéro des colonnes, car
                                // Secretlint commence la numérotation à zéro.
                                column: result.loc.start.column + 1,
                                endLine: result.loc.end.line,
                                endColumn: result.loc.end.column + 1,
                            },
                        ],
                    };
                })
                .filter((n) => this.level >= n.severity);
        } catch (err) {
            if (undefined === err.errors) {
                return [
                    {
                        file,
                        linter: "secretlint",
                        severity: Severities.FATAL,
                        message: err.message,
                    },
                ];
            }
            return err.errors.map((error) => ({
                file,
                linter: "secretlint",
                severity: Severities.FATAL,
                message: error.message,
            }));
        }
    }
}
