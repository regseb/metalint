/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import process from "node:process";
import Severities from "../severities.js";
import Formatter from "./formatter.js";

/**
 * @import { Writable } from "node:stream"
 * @import { Level } from "../levels.js"
 * @import { Notice } from "../results.js"
 */

/**
 * Le formateur qui écrit les résultats pour les Github Actions.
 *
 * @see https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions
 */
export default class GitHubFormatter extends Formatter {
    /**
     * Le flux où écrire les résultats.
     *
     * @type {Writable}
     */
    #writer;

    /**
     * Crée un formateur.
     *
     * @param {Level}    level            Le niveau de sévérité minimum des
     *                                    notifications affichées.
     * @param {Object}   options          Les options du formateur.
     * @param {Writable} [options.writer] Le flux où écrire les résultats.
     */
    constructor(level, options) {
        super(level);
        this.#writer = options.writer ?? process.stdout;
    }

    /**
     * Affiche les éventuelles notifications d'un fichier.
     *
     * @param {string}   file      Le fichier analysé.
     * @param {Notice[]} [notices] La liste des notifications ou `undefined`.
     * @returns {Promise<void>} La promesse indiquant que les notifications ont
     *                          été traitées.
     */
    notify(file, notices) {
        // Si le fichier n'a pas été vérifié (car il ne rentrait pas dans les
        // critères des checkers).
        if (undefined === notices) {
            return Promise.resolve();
        }

        for (const notice of notices.filter((n) => this.level >= n.severity)) {
            this.#writer.write("::");
            switch (notice.severity) {
                case Severities.FATAL:
                case Severities.ERROR:
                    this.#writer.write("error");
                    break;
                case Severities.WARN:
                    this.#writer.write("warning");
                    break;
                default:
                    this.#writer.write("notice");
            }

            this.#writer.write(` file=${file}`);

            if (0 !== notice.locations.length) {
                const location = notice.locations[0];
                this.#writer.write(`,line=${location.line}`);
                if (undefined !== location.column) {
                    this.#writer.write(`,col=${location.column}`);
                }
                if (undefined !== location.endLine) {
                    this.#writer.write(`,endLine=${location.endLine}`);
                }
                if (undefined !== location.endColumn) {
                    this.#writer.write(`,endColumn=${location.endColumn}`);
                }
            }

            this.#writer.write(`::${notice.message} (${notice.linter}`);
            if (undefined !== notice.rule) {
                this.#writer.write(`.${notice.rule}`);
            }
            this.#writer.write(")\n");
        }
        return Promise.resolve();
    }

    /**
     * Finalise les résultats.
     *
     * @returns {Promise<void>} La promesse indiquant que les résultats ont été
     *                          finalisés.
     */
    finalize() {
        return new Promise((resolve) => {
            this.#writer.write("", () => resolve());
        });
    }
}
