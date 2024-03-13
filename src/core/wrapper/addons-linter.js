/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import path from "node:path/posix";
import linter from "addons-linter";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

/**
 * @typedef {import("../../types/notice.d.ts").PartialNotice} PartialNotice
 * @typedef {import("../../types/level.d.ts").default} Level
 */

/**
 * L'enrobage du linter <strong>Add-ons Linter</strong>.
 *
 * @see https://www.npmjs.com/package/addons-linter
 */
export default class AddonsLinterWrapper extends Wrapper {
    /**
     * Les options du linter.
     *
     * @type {Record<string, unknown>}
     * @see https://github.com/mozilla/addons-linter#linter-api-usage
     */
    #options;

    /**
     * Crée un enrobage pour le linter <strong>Add-ons Linter</strong>.
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
        this.#options = {
            logLevel: "silent",
            // Ne rien afficher dans la console.
            output: "none",
            shouldScanFile: (_fileOrDirName, _isDir) => true,
            ...options,
        };
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
            ...this.#options,
            _: [file],
        };
        const results = await linter.createInstance({ config }).run();
        return [...results.errors, ...results.warnings, ...results.notices]
            .map((result) => {
                let severity;
                switch (result["_type"]) {
                    case "error":
                        severity = Severities.ERROR;
                        break;
                    case "warning":
                        severity = Severities.WARN;
                        break;
                    default:
                        severity = Severities.INFO;
                }

                return {
                    file:
                        null === result.file || undefined === result.file
                            ? file
                            : path.join(file, result.file),
                    linter: "addons-linter",
                    rule: result.code,
                    severity,
                    message: result.message,
                };
            })
            .filter((n) => this.level >= n.severity);
    }
}
