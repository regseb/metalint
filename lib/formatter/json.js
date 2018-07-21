/**
 * @module formatter/json
 */

"use strict";

/**
 * Le formateur qui écrit les résultats brut (au format JSON).
 */
const Formatter = class {

    /**
     * Crée un formateur.
     *
     * @param {number} level          Le niveau de sévérité minimum des
     *                                notifications affichées.
     * @param {Object} writer         Le flux où écrire les résultats.
     * @param {Object} options        Les options du formateur.
     * @param {number} options.indent La taille des indentations (en espace).
     */
    constructor(level, writer, { indent = 0 }) {
        this.level   = level;
        this.writer  = writer;
        this.indent  = indent;
        this.results = {};
    }

    /**
     * Insère les notifications dans un objet JSON.
     *
     * @param {string}         file    Le fichier analysé.
     * @param {Array.<Object>} notices La liste des notifications ou
     *                                 <code>null</code>.
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
        // Afficher l’objet JSON.
        this.writer.write(JSON.stringify(this.results, null, this.indent));
        this.writer.write("\n");
    }
};

module.exports = Formatter;
