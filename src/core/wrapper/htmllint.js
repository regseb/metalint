/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
// @ts-expect-error -- htmllint ne fournit pas de types.
import htmllint from "htmllint";
import Levels from "../levels.js";
import Wrapper from "./wrapper.js";

/**
 * @import { Level } from "../levels.js"
 * @import { PartialNotice } from "../results.js"
 */

/**
 * L'enrobage du linter **htmllint**.
 *
 * @see https://www.npmjs.com/package/htmllint
 */
export default class HtmllintWrapper extends Wrapper {
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
     * @see https://github.com/htmllint/htmllint/wiki/Options
     */
    #options;

    /**
     * Crée un enrobage pour le linter **htmllint**.
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
        if (Levels.ERROR > this.level) {
            return [];
        }

        const source = await fs.readFile(file, "utf8");
        const results = await htmllint(source, this.#options);
        return results.map((result) => ({
            file,
            linter: "htmllint",
            rule: result.rule,
            message: result.code,
            locations: [{ line: result.line, column: result.column }],
        }));
    }
}
