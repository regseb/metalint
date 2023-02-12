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
 * Le formateur qui écrit les résultats dans un format simple : une notification
 * par ligne.
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
     * La marque indiquant si c'est la première ligne qui est affichée.
     *
     * @type {boolean}
     */
    #first = true;

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
        if (
            undefined === notices ||
            !notices.some((n) => this.#level >= n.severity)
        ) {
            return;
        }

        // Séparer les fichiers par une ligne vide.
        if (this.#first) {
            this.#first = false;
        } else {
            this.#writer.write("\n");
        }

        for (const notice of notices.filter((n) => this.#level >= n.severity)) {
            this.#writer.write(`${file}:`);

            if (0 === notice.locations.length) {
                this.#writer.write(":");
            } else {
                this.#writer.write(`${notice.locations[0].line.toString()}:`);
                if ("column" in notice.locations[0]) {
                    this.#writer.write(notice.locations[0].column.toString());
                }
            }

            this.#writer.write(`: ${notice.message} (${notice.linter}`);
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
