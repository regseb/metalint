/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import path from "node:path/posix";
// eslint-disable-next-line import/no-unresolved
import { publint } from "publint";
// Désactiver la règle suivante pour cet import, car elle ne supporte pas la
// propriété "exports" du package.json.
// https://github.com/import-js/eslint-plugin-import/issues/1810
// eslint-disable-next-line import/no-unresolved
import { formatMessage } from "publint/utils";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

/**
 * @import { Level } from "../levels.js"
 * @import { PartialNotice } from "../results.js"
 * @import { Severity } from "../severities.js"
 */

/**
 * Les types de messages (retournés par publint) avec leur sévérité équivalente.
 *
 * @type {Object<string, Severity>}
 */
const TYPES = {
    suggestion: Severities.INFO,
    warning: Severities.WARN,
    error: Severities.ERROR,
};

/**
 * L'enrobage du linter **publint**.
 *
 * @see https://www.npmjs.com/package/publint
 */
export default class PublintWrapper extends Wrapper {
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
     * @see https://publint.dev/docs/javascript-api
     */
    #options;

    /**
     * Crée un enrobage pour le linter **publint**.
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

        if (!/(?:^|\/)package\.json$/v.test(file)) {
            return [
                {
                    file,
                    linter: "publint",
                    severity: Severities.FATAL,
                    message: `${file} must end with "package.json".`,
                },
            ];
        }
        try {
            const { messages } = await publint({
                pkgDir: path.dirname(file),
                ...this.#options,
            });
            const pkg = JSON.parse(await fs.readFile(file, "utf8"));
            return messages
                .map((message) => ({
                    file,
                    linter: "publint",
                    rule: message.code,
                    severity: TYPES[message.type],
                    message: formatMessage(message, pkg, { color: false }),
                }))
                .filter((n) => this.level >= n.severity);
        } catch (err) {
            return [
                {
                    file,
                    severity: Severities.FATAL,
                    linter: "publint",
                    message: err.message,
                },
            ];
        }
    }
}
