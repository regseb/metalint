/**
 * @module
 */

/**
 * @typedef {NodeJS.WritableStream} WritableStream
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Le formateur qui écrit les résultats brut (au format JSON).
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
     * La taille des indentations (en espace).
     *
     * @type {number}
     */
    #indent;

    /**
     * Les notifications (regroupées par fichiers) ayant une sévérité supérieure
     * au niveau minimum.
     *
     * @type {Object<string, Notice[]|undefined>}
     */
    #results = {};

    /**
     * Crée un formateur.
     *
     * @param {number}         level            Le niveau de sévérité minimum
     *                                          des notifications affichées.
     * @param {WritableStream} writer           Le flux où écrire les résultats.
     * @param {Object}         options          Les options du formateur.
     * @param {number}         [options.indent] La taille des indentations (en
     *                                          espace).
     */
    constructor(level, writer, options) {
        this.#level = level;
        this.#writer = writer;
        this.#indent = options.indent ?? 0;
    }

    /**
     * Insère les notifications dans un objet JSON.
     *
     * @param {string}             file    Le fichier analysé.
     * @param {Notice[]|undefined} notices La liste des notifications ou
     *                                     <code>undefined</code>.
     */
    notify(file, notices) {
        this.#results[file] = notices?.filter((n) => this.#level >= n.severity);
    }

    /**
     * Affiche les résultats.
     *
     * @returns {Promise<void>} La promesse indiquant que tous les textes sont
     *                          écrits.
     */
    finalize() {
        // Afficher l'objet JSON.
        this.#writer.write(JSON.stringify(
            this.#results,
            // Remplacer les undefined par null.
            // eslint-disable-next-line unicorn/no-null
            (_, v) => v ?? null,
            this.#indent,
        ));
        return new Promise((resolve) => {
            this.#writer.write("\n", "utf8", resolve);
        });
    }
};
