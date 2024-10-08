/**
 * @license MIT
 * @author Sébastien Règne
 */

import process from "node:process";
import Formatter from "../../src/core/formatter/formatter.js";

/**
 * @import { Writable } from "node:stream"
 * @import { Level } from "../../src/core/levels.js"
 * @import { Notice } from "../../src/core/results.js"
 */

/**
 * Le formateur qui écrit les résultats avec des phrases en français.
 */
export default class FrenchFormatter extends Formatter {
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
     */
    notify(file, notices) {
        // Si le fichier n'a pas été vérifié (car il ne rentrait pas dans les
        // critères des checkers).
        if (undefined === notices) {
            return Promise.resolve();
        }

        for (const notice of notices.filter((n) => this.level >= n.severity)) {
            this.#writer.write(`Le linter ${notice.linter} a trouvé `);
            if (undefined === notice.rule) {
                this.#writer.write("un problème ");
            } else {
                this.#writer.write(
                    `que la règle ${notice.rule} n'est pas respectée `,
                );
            }
            if (0 === notice.locations.length) {
                this.#writer.write("dans le fichier ");
            } else {
                this.#writer.write(
                    `à la ligne ${notice.locations[0].line} du fichier `,
                );
            }
            this.#writer.write(`${file} : ${notice.message}\n`);
        }
        return Promise.resolve();
    }

    /**
     * Finalise l'affichage.
     *
     * @returns {Promise<void>} La promesse indiquant que tous les textes sont
     *                          écrits.
     */
    finalize() {
        return new Promise((resolve) => {
            this.#writer.write("", () => resolve());
        });
    }
}
