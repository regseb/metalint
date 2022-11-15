/**
 * @module
 */

import SEVERITY from "../severity.js";

/**
 * @typedef {NodeJS.WritableStream} WritableStream
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Le formateur qui écrit les résultats pour les Github Actions.
 */
export const Formatter = class {

    /**
     * Le niveau de sévérité minimum des notifications affichées.
     *
     * @type {number}
     */
    #level;

    /**
     * Le flux où écrire les résultats.
     *
     * @type {WritableStream}
     */
    #writer;

    /**
     * Crée un formateur.
     *
     * @param {number}         level  Le niveau de sévérité minimum des
     *                                notifications affichées.
     * @param {WritableStream} writer Le flux où écrire les résultats.
     */
    constructor(level, writer) {
        this.#level = level;
        this.#writer = writer;
    }

    /**
     * Affiche les éventuelles notifications d'un fichier.
     *
     * @param {string}             file    Le fichier analysé.
     * @param {Notice[]|undefined} notices La liste des notifications ou
     *                                     <code>undefined</code>.
     */
    notify(file, notices) {
        // Si le fichier n'a pas été vérifié (car il ne rentrait pas dans les
        // critères des checkers) ou si aucune notification a été remontée.
        if (undefined === notices ||
                !notices.some((n) => this.#level >= n.severity)) {
            return;
        }

        for (const notice of notices.filter((n) => this.#level >= n.severity)) {
            this.#writer.write("::");
            switch (notice.severity) {
                case SEVERITY.FATAL: case SEVERITY.ERROR:
                    this.#writer.write("error");
                    break;
                case SEVERITY.WARN:
                    this.#writer.write("warning");
                    break;
                default:
                    this.#writer.write("notice");
            }

            this.#writer.write(` file=${file}`);

            if (0 !== notice.locations.length) {
                const location = notice.locations[0];
                this.#writer.write(`,line=${location.line.toString()}`);
                if ("column" in location) {
                    this.#writer.write(`,col=${location.column.toString()}`);
                }
                if ("endLine" in location) {
                    this.#writer.write(",endLine=" +
                                       location.endLine.toString());
                }
                if ("endColumn" in location) {
                    this.#writer.write(",endColumn=" +
                                       location.endColumn.toString());
                }
            }

            this.#writer.write(`::${notice.message} (${notice.linter}`);
            if (undefined !== notice.rule) {
                this.#writer.write(`.${notice.rule}`);
            }
            this.#writer.write(")\n");
        }
    }

    /**
     * Finalise l'affichage.
     *
     * @returns {Promise<void>} La promesse indiquant que tous les textes sont
     *                          écrits.
     */
    finalize() {
        return new Promise((resolve) => {
            this.#writer.write("", "utf8", resolve);
        });
    }
};
