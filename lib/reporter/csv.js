"use strict";

const None = require("./none");

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
const Reporter = class extends None {

    /**
     * Crée un rapporteur.
     *
     * @param {Object} writer  Le flux où écrire les résultats.
     * @param {number} verbose Le niveau de verbosité.
     */
    constructor(writer, verbose) {
        super(writer, verbose);

        // Ecrire la ligne des titres.
        this.writer.write("file,line,column,message");
        if (1 <= this.verbose) {
            this.writer.write(",linter");
            if (2 <= this.verbose) {
                this.writer.write(",rule");
            }
        }
        this.writer.write("\r\n");
    }

    /**
     * Affiche les éventuelles notifications d'un fichier.
     *
     * @param {string}         file    Le fichier analysé.
     * @param {Array.<Object>} notices La liste des notifications ou
     *                                 <code>null</code>.
     */
    notify(file, notices) {
        super.notify(file, notices);

        // Si le fichier n’a pas été vérifié (car il ne rentrait pas dans les
        // critères des checkers).
        if (null === notices) {
            return;
        }

        for (const notice of notices) {
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
            if (1 <= this.verbose) {
                this.writer.write("," + notice.linter);
                if (2 <= this.verbose) {
                    this.writer.write(",");
                    if (null !== notice.rule) {
                        this.writer.write(doublequote(notice.rule));
                    }
                }
            }
            this.writer.write("\r\n");
        }
    }
};

module.exports = Reporter;
