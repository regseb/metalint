/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import { HTMLHint } from "htmlhint";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

/**
 * @typedef {import("../results.js").PartialNotice} PartialNotice
 * @typedef {import("../levels.js").Level} Level
 */

/**
 * L'enrobage du linter <strong>HTMLHint</strong>.
 *
 * @see https://www.npmjs.com/package/htmlhint
 */
export default class HTMLHintWrapper extends Wrapper {
    /**
     * Les options du linter.
     *
     * @type {Record<string, unknown>}
     * @see https://htmlhint.com/docs/user-guide/list-rules
     */
    #options;

    /**
     * Crée un enrobage pour le linter <strong>HTMLHint</strong>.
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

        const source = await fs.readFile(file, "utf8");
        return HTMLHint.verify(source, this.#options)
            .map((result) => ({
                file,
                linter: "htmlhint",
                rule: result.rule.id,
                severity:
                    "warning" === result.type
                        ? Severities.WARN
                        : Severities.ERROR,
                message: result.message,
                locations: [{ line: result.line, column: result.col }],
            }))
            .filter((n) => this.level >= n.severity);
    }
}
