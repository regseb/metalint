/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

/**
 * @typedef {NodeJS.WritableStream} WritableStream
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Le formateur qui écrit les résultats avec des phrases en français.
 */
export const Formatter = class {
    #level;

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
        // critères des checkers).
        if (undefined === notices) {
            return;
        }

        for (const notice of notices.filter((n) => this.#level >= n.severity)) {
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
                    `à la ligne ${notice.locations[0].line.toString()} du` +
                        " fichier ",
                );
            }
            this.#writer.write(`${file} : ${notice.message}\n`);
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
