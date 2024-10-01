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
 * Le formateur qui écrit les résultats bruts (au format JSON). La seule
 * altération des résultats est le remplacement des `undefined` par des `null`.
 *
 * @see https://www.json.org/
 */
export default class JSONFormatter extends Formatter {
    /**
     * Le flux où écrire les résultats.
     *
     * @type {Writable}
     */
    #writer;

    /**
     * La taille des indentations (en espace).
     *
     * @type {number}
     */
    #indent;

    /**
     * Les notifications (regroupées par fichiers) ayant une sévérité supérieure
     * au niveau minimum.
     *
     * @type {Record<string, Notice[]|undefined>}
     */
    #results = {};

    /**
     * Crée un formateur.
     *
     * @param {Level}    level            Le niveau de sévérité minimum des
     *                                    notifications affichées.
     * @param {Object}   options          Les options du formateur.
     * @param {Writable} [options.writer] Le flux où écrire les résultats.
     * @param {number}   [options.indent] La taille des indentations (en
     *                                    espace).
     */
    constructor(level, options) {
        super(level);
        this.#writer = options.writer ?? process.stdout;
        this.#indent = options.indent ?? 0;
    }

    /**
     * Insère les notifications dans un objet JSON.
     *
     * @param {string}   file      Le fichier analysé.
     * @param {Notice[]} [notices] La liste des notifications ou `undefined`.
     * @returns {Promise<void>} La promesse indiquant que les notifications ont
     *                          été traitées.
     */
    notify(file, notices) {
        this.#results[file] = notices?.filter((n) => this.level >= n.severity);
        return Promise.resolve();
    }

    /**
     * Finalise les résultats.
     *
     * @returns {Promise<void>} La promesse indiquant que les résultats ont été
     *                          finalisés.
     */
    finalize() {
        // Afficher l'objet JSON.
        this.#writer.write(
            JSON.stringify(
                this.#results,
                // Remplacer les undefined par des null.
                // eslint-disable-next-line unicorn/no-null
                (_, v) => v ?? null,
                this.#indent,
            ),
        );
        return new Promise((resolve) => {
            this.#writer.write("\n", () => resolve());
        });
    }
}
