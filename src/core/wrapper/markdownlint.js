/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import markdownlint from "markdownlint";
import Levels from "../levels.js";
import Wrapper from "./wrapper.js";

/**
 * @typedef {import("../results.js").PartialNotice} PartialNotice
 * @typedef {import("../levels.js").Level} Level
 */

/**
 * L'enrobage du linter <strong>Markdownlint</strong>.
 *
 * @see https://www.npmjs.com/package/markdownlint
 */
export default class MarkdownlintWrapper extends Wrapper {
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
     * @see https://github.com/DavidAnson/markdownlint#rules--aliases
     */
    #options;

    /**
     * Crée un enrobage pour le linter <strong>Markdownlint</strong>.
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
        if (Levels.ERROR > this.level) {
            return [];
        }

        const config = {
            files: file,
            config: this.#options,
        };
        const results = await markdownlint.promises.markdownlint(config);
        return Object.values(results)
            .shift()
            .map((result) => ({
                file,
                linter: "markdownlint",
                rule: result.ruleNames.join("/"),
                message:
                    result.ruleDescription +
                    " [" +
                    (result.errorDetail ?? "") +
                    (null === result.errorContext
                        ? ""
                        : `Context: "${result.errorContext}"`) +
                    "]",
                locations: [{ line: result.lineNumber }],
            }));
    }
}
