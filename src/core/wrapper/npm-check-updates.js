/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import ncu from "npm-check-updates";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

/**
 * @typedef {import("../../types/notice.d.ts").PartialNotice} PartialNotice
 * @typedef {import("../../types/level.d.ts").default} Level
 */

/**
 * L'enrobage du linter <strong>npm-check-updates</strong>.
 *
 * @see https://www.npmjs.com/package/npm-check-updates
 */
export default class NpmCheckUpdatesWrapper extends Wrapper {
    /**
     * Les options du linter.
     *
     * @type {Record<string, unknown>}
     */
    #options;

    /**
     * Crée un enrobage pour le linter <strong>npm-check-updates</strong>.
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
        if (Levels.FATAL > this.level) {
            return [];
        }

        try {
            const results = await ncu.run({
                ...this.#options,
                packageFile: file,
            });
            if (Levels.ERROR > this.level) {
                return [];
            }

            return Object.entries(results).map(([dep, version]) => ({
                file,
                linter: "npm-check-updates",
                message: `Dependency '${dep}' has a new version '${version}'.`,
            }));
        } catch (err) {
            return [
                {
                    file,
                    linter: "npm-check-updates",
                    severity: Severities.FATAL,
                    message: err.message,
                },
            ];
        }
    }
}
