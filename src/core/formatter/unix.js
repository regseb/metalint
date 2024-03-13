/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import process from "node:process";
import Formatter from "./formatter.js";

/**
 * @typedef {import("node:stream").Writable} Writable
 * @typedef {import("../../types/level.d.ts").default} Level
 * @typedef {import("../../types/notice.d.ts").default} Notice
 */

/**
 * Le formateur qui écrit les résultats dans un format simple : une notification
 * par ligne.
 */
export default class UnixFormatter extends Formatter {
    /**
     * Le flux où écrire les résultats.
     *
     * @type {Writable}
     */
    #writer;

    /**
     * La marque indiquant si c'est la première ligne qui est affichée.
     *
     * @type {boolean}
     */
    #first = true;

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
     * @param {string}             file    Le fichier analysé.
     * @param {Notice[]|undefined} notices La liste des notifications ou
     *                                     <code>undefined</code>.
     * @returns {Promise<void>} La promesse indiquant que les notifications ont
     *                          été traitées.
     */
    notify(file, notices) {
        // Si le fichier n'a pas été vérifié (car il ne rentrait pas dans les
        // critères des checkers) ou si aucune notification a été remontée.
        if (
            undefined === notices ||
            !notices.some((n) => this.level >= n.severity)
        ) {
            return Promise.resolve();
        }

        // Séparer les fichiers par une ligne vide.
        if (this.#first) {
            this.#first = false;
        } else {
            this.#writer.write("\n");
        }

        for (const notice of notices.filter((n) => this.level >= n.severity)) {
            this.#writer.write(`${file}:`);

            if (0 === notice.locations.length) {
                this.#writer.write(":");
            } else {
                this.#writer.write(`${notice.locations[0].line}:`);
                if (undefined !== notice.locations[0].column) {
                    this.#writer.write(notice.locations[0].column.toString());
                }
            }

            this.#writer.write(`: ${notice.message} (${notice.linter}`);
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
