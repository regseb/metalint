"use strict";

/**
 * Protège une chaîne de caractères en l’entourant de guillemets et en doublant
 * les guillemets.
 *
 * @param {string} value Le texte qui sera protégé.
 * @return {string} Le texte protégé.
 */
const doublequote = function (value) {
    return "\"" + value.replace(/"/g, "\"\"") + "\"";
};

/**
 * Le rapporteur qui écrit les résultats dans un format CSV.
 *
 * @see https://tools.ietf.org/html/rfc4180
 */
const Reporter = class {

    /**
     * Crée un rapporteur.
     *
     * @param {number} level  Le niveau de sévérité minimum des notifications
     *                        affichées.
     * @param {Object} writer Le flux où écrire les résultats.
     */
    constructor(level, writer) {
        this.level  = level;
        this.writer = writer;

        // Ecrire la ligne des titres.
        this.writer.write("file,line,column,message,linter,rule\r\n");
    }

    /**
     * Affiche les éventuelles notifications d'un fichier.
     *
     * @param {string}         file    Le fichier analysé.
     * @param {Array.<Object>} notices La liste des notifications ou
     *                                 <code>null</code>.
     */
    notify(file, notices) {
        // Si le fichier n’a pas été vérifié (car il ne rentrait pas dans les
        // critères des checkers).
        if (null === notices) {
            return;
        }

        for (const notice of notices.filter((n) => this.level >= n.severity)) {
            this.writer.write(doublequote(file) + ",");

            if (0 === notice.locations.length) {
                this.writer.write(",");
            } else {
                this.writer.write(notice.locations[0].line.toString() + ",");
                if ("column" in notice.locations[0]) {
                    this.writer.write(notice.locations[0].column.toString());
                }
            }

            this.writer.write("," + doublequote(notice.message));
            this.writer.write("," + notice.linter);
            this.writer.write(",");
            if (null !== notice.rule) {
                this.writer.write(doublequote(notice.rule));
            }
            this.writer.write("\r\n");
        }
    }

    /**
     * Finalise l'affichage.
     */
    finalize() {
        // Ne rien faire.
    }
};

module.exports = Reporter;
