/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import path from "node:path/posix";
import depcheck from "depcheck";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

/**
 * @import { Level } from "../levels.js"
 * @import { PartialNotice } from "../results.js"
 */

/**
 * L'enrobage du linter **Depcheck**.
 *
 * @see https://www.npmjs.com/package/depcheck
 */
export default class DepcheckWrapper extends Wrapper {
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
     * Crée un enrobage pour le linter **Depcheck**.
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
                    linter: "depcheck",
                    severity: Severities.FATAL,
                    message: `${file} must end with "package.json".`,
                },
            ];
        }
        try {
            const dir = path.dirname(file);
            const results = await depcheck(
                path.join(this.root, dir),
                this.#options,
            );

            const notices = [];
            for (const dependency of results.dependencies) {
                notices.push({
                    file,
                    severity: Severities.ERROR,
                    linter: "depcheck",
                    message:
                        `The dependency '${dependency}' is declared in the` +
                        " 'package.json' file, but not used by any code.",
                });
            }
            for (const devDependency of results.devDependencies) {
                notices.push({
                    file,
                    severity: Severities.ERROR,
                    linter: "depcheck",
                    message:
                        `The devDependency '${devDependency}' is declared in` +
                        " the 'package.json' file, but not used by any code.",
                });
            }
            for (const [dependency, subfiles] of Object.entries(
                results.missing,
            )) {
                for (const subfile of subfiles) {
                    notices.push({
                        file: path.relative(dir, subfile),
                        severity: Severities.ERROR,
                        linter: "depcheck",
                        message:
                            `The dependency '${dependency}' is used in the` +
                            " code, but not declared in the 'package.json'" +
                            " file.",
                    });
                }
            }
            for (const [subfile, message] of Object.entries(
                results.invalidFiles,
            )) {
                notices.push({
                    file: path.relative(dir, subfile),
                    severity: Severities.FATAL,
                    linter: "depcheck",
                    message,
                });
            }
            for (const [subfile, message] of Object.entries(
                results.invalidDirs,
            )) {
                notices.push({
                    file: path.relative(dir, subfile),
                    severity: Severities.FATAL,
                    linter: "depcheck",
                    message,
                });
            }
            return notices.filter((n) => this.level >= n.severity);
        } catch (err) {
            return [
                {
                    file,
                    severity: Severities.FATAL,
                    linter: "depcheck",
                    message: err.message,
                },
            ];
        }
    }
}
