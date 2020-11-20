/**
 * @module
 */

/**
 * @typedef {NodeJS.WritableStream} WritableStream
 * @typedef {import("../types").Notice} Notice
 */

/**
 * Le formateur qui écrit les résultats brut (au format JSON).
 */
export const Formatter = class {

    /**
     * Crée un formateur.
     *
     * @param {number}         level          Le niveau de sévérité minimum des
     *                                        notifications affichées.
     * @param {WritableStream} writer         Le flux où écrire les résultats.
     * @param {Object}         options        Les options du formateur.
     * @param {number}         options.indent La taille des indentations (en
     *                                        espace).
     */
    constructor(level, writer, { indent = 0 }) {
        /** @type {number} */
        this.level = level;

        /** @type {WritableStream} */
        this.writer = writer;

        /** @type {number} */
        this.indent = indent;

        /** @type {Object<string, ?(Notice[])>} */
        this.results = {};
    }

    /**
     * Insère les notifications dans un objet JSON.
     *
     * @param {string}      file    Le fichier analysé.
     * @param {?(Notice[])} notices La liste des notifications ou
     *                              <code>null</code>.
     */
    notify(file, notices) {
        this.results[file] = null === notices
                              ? null
                              : notices.filter((n) => this.level >= n.severity);
    }

    /**
     * Affiche les résultats.
     */
    finalize() {
        // Afficher l'objet JSON.
        this.writer.write(JSON.stringify(this.results, null, this.indent));
        return new Promise((resolve) => {
            this.writer.write("\n", resolve);
        });
    }
};
