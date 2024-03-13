/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import { parse } from "@prantlf/jsonlint";
import Levels from "../levels.js";
import Wrapper from "./wrapper.js";

/**
 * @typedef {import("../../types/notice.d.ts").PartialNotice} PartialNotice
 * @typedef {import("../../types/level.d.ts").default} Level
 */

/**
 * L'enrobage du linter <strong>JSON Lint</strong> de <strong>prantlf</strong>.
 *
 * @see https://www.npmjs.com/package/@prantlf/jsonlint
 */
export default class PrantlfJSONLintWrapper extends Wrapper {
    /**
     * Les options du linter.
     *
     * @type {Record<string, unknown>}
     * @see https://github.com/prantlf/jsonlint#module-interface
     */
    #options;

    /**
     * Crée un enrobage pour le linter <strong>JSON Lint</strong> de
     * <strong>prantlf</strong>.
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
        try {
            parse(source, this.#options);
            return [];
        } catch (err) {
            return [
                {
                    file,
                    linter: "prantlf__jsonlint",
                    message: err.reason,
                    locations: [
                        {
                            line: err.location.start.line,
                            column: err.location.start.column,
                        },
                    ],
                },
            ];
        }
    }
}
