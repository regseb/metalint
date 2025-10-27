/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import process from "node:process";
import Formatter from "./formatter.js";

/**
 * @import { Writable } from "node:stream"
 * @import { Level } from "../levels.js"
 * @import { Notice } from "../results.js"
 */

/**
 * Protège une chaîne de caractères en l'entourant de guillemets et en doublant
 * les guillemets.
 *
 * @param {string} value Le texte qui sera protégé.
 * @returns {string} Le texte protégé.
 */
const doublequote = (value) => {
    return `"${value.replaceAll('"', '""')}"`;
};

/**
 * Le formateur qui écrit les résultats dans un format CSV.
 *
 * @see https://tools.ietf.org/html/rfc4180
 */
export default class CSVFormatter extends Formatter {
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

        // Écrire la ligne des titres.
        this.#writer.write("file,line,column,message,linter,rule\r\n");
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
            this.#writer.write(`${doublequote(file)},`);

            if (0 === notice.locations.length) {
                this.#writer.write(",");
            } else {
                this.#writer.write(`${notice.locations[0].line},`);
                if (undefined !== notice.locations[0].column) {
                    this.#writer.write(notice.locations[0].column.toString());
                }
            }

            this.#writer.write(
                `,${doublequote(notice.message)},${notice.linter},`,
            );
            if (undefined !== notice.rule) {
                this.#writer.write(doublequote(notice.rule));
            }
            this.#writer.write("\r\n");
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
