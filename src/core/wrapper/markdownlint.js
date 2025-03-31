/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
// Désactiver la règle suivante pour cet import, car elle ne supporte pas la
// propriété "exports" du package.json.
// https://github.com/import-js/eslint-plugin-import/issues/1810
// eslint-disable-next-line import/no-unresolved
import { applyFixes } from "markdownlint";
// Désactiver la règle suivante pour cet import, car elle ne supporte pas la
// propriété "exports" du package.json.
// https://github.com/import-js/eslint-plugin-import/issues/1810
// eslint-disable-next-line import/no-unresolved
import { lint as markdownlint } from "markdownlint/promise";
import Levels from "../levels.js";
import Wrapper from "./wrapper.js";

/**
 * @import { Level } from "../levels.js"
 * @import { PartialNotice } from "../results.js"
 */

/**
 * L'enrobage du linter **Markdownlint**.
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
     * Crée un enrobage pour le linter **Markdownlint**.
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
        if (Levels.ERROR > this.level && !this.fix) {
            return [];
        }

        const config = {
            files: file,
            config: this.#options,
        };
        const results = await markdownlint(config);

        if (this.fix) {
            const source = await fs.readFile(file, "utf8");
            const fixed = applyFixes(source, results[file]);
            await fs.writeFile(file, fixed);
        }
        if (Levels.ERROR > this.level) {
            return [];
        }

        return (
            results[file]
                // Enlever les notifications qui ont été corrigées.
                .filter((result) => !this.fix || null === result.fixInfo)
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
                }))
        );
    }
}
