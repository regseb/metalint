/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import sortPackageJson from "sort-package-json";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

/**
 * @typedef {import("../results.js").PartialNotice} PartialNotice
 * @typedef {import("../levels.js").Level} Level
 */

/**
 * L'enrobage du linter <strong>Sort Package.json</strong>.
 *
 * @see https://www.npmjs.com/package/sort-package-json
 */
export default class SortPackageJsonWrapper extends Wrapper {
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
     */
    #options;

    /**
     * Crée un enrobage pour le linter <strong>Sort Package.json</strong>.
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
        if (Levels.FATAL > this.level && !this.fix) {
            return [];
        }

        const source = await fs.readFile(file, "utf8");

        try {
            const output = sortPackageJson(source, this.#options);
            if (source !== output) {
                if (this.fix) {
                    await fs.writeFile(file, output);
                    return [];
                }
                if (Levels.ERROR > this.level) {
                    return [];
                }
                return [
                    {
                        file,
                        linter: "sort-package-json",
                        message: "File was not sorted.",
                    },
                ];
            }
            return [];
        } catch (err) {
            return [
                {
                    file,
                    linter: "sort-package-json",
                    severity: Severities.FATAL,
                    message: err.message,
                },
            ];
        }
    }
}
