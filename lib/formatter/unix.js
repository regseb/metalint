/**
 * @module formatter/unix
 */

"use strict";

/**
 * Le formateur qui écrit les résultats dans un format simple : une notification
 * par ligne.
 */
const Formatter = class {

    /**
     * Crée un formateur.
     *
     * @param {number} level  Le niveau de sévérité minimum des notifications
     *                        affichées.
     * @param {object} writer Le flux où écrire les résultats.
     */
    constructor(level, writer) {
        this.level  = level;
        this.writer = writer;
        this.first  = true;
    }

    /**
     * Affiche les éventuelles notifications d'un fichier.
     *
     * @param {string}         file    Le fichier analysé.
     * @param {Array.<object>} notices La liste des notifications ou
     *                                 <code>null</code>.
     */
    notify(file, notices) {
        // Si le fichier n’a pas été vérifié (car il ne rentrait pas dans les
        // critères des checkers) ou si aucune notification a été remontée.
        if (null === notices ||
                !notices.some((n) => this.level >= n.severity)) {
            return;
        }

        // Séparer les fichiers par une ligne vide.
        if (this.first) {
            this.first = false;
        } else {
            this.writer.write("\n");
        }

        for (const notice of notices.filter((n) => this.level >= n.severity)) {
            this.writer.write(file + ":");

            if (0 === notice.locations.length) {
                this.writer.write(":");
            } else {
                this.writer.write(notice.locations[0].line.toString() + ":");
                if ("column" in notice.locations[0]) {
                    this.writer.write(notice.locations[0].column.toString());
                }
            }

            this.writer.write(": " + notice.message);
            this.writer.write(" (" + notice.linter);
            if (null !== notice.rule) {
                this.writer.write("." + notice.rule);
            }
            this.writer.write(")\n");
        }
    }

    /**
     * Finalise l'affichage.
     */
    finalize() {
        // Ne rien faire.
    }
};

module.exports = Formatter;
