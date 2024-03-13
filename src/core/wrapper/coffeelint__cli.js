/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import coffeelint from "@coffeelint/cli";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

/**
 * @typedef {import("../../types/notice.d.ts").PartialNotice} PartialNotice
 * @typedef {import("../../types/level.d.ts").default} Level
 */

/**
 * L'enrobage du linter <strong>CoffeeLint</strong>.
 *
 * @see https://www.npmjs.com/package/@coffeelint/cli
 */
export default class CoffeeLintCliWrapper extends Wrapper {
    /**
     * Les options du linter.
     *
     * @type {Record<string, unknown>}
     * @see https://coffeelint.github.io/#options
     */
    #options;

    /**
     * Crée un enrobage pour le linter <strong>CoffeeLint</strong>.
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
        return coffeelint
            .lint(source, this.#options)
            .map((result) => ({
                file,
                linter: "coffeelint__cli",
                rule: result.rule,
                severity:
                    "warn" === result.level
                        ? Severities.WARN
                        : Severities.ERROR,
                message: result.message,
                locations: [{ line: result.lineNumber }],
            }))
            .filter((n) => this.level >= n.severity);
    }
}
