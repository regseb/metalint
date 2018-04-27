"use strict";

const None = require("./none");

/**
 * Le rapporteur qui écrit les résultats dans un format simple : une
 * notification par ligne.
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

        this.first = true;
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
        // critères des checkers) ou si aucune notification a été remontée.
        if (null === notices || 0 === notices.length) {
            return;
        }

        // Séparer les fichiers par une ligne vide.
        if (this.first) {
            this.first = false;
        } else {
            this.writer.write("\n");
        }

        for (const notice of notices) {
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
            if (1 <= this.verbose) {
                this.writer.write(" (" + notice.linter);
                if (2 <= this.verbose && null !== notice.rule) {
                    this.writer.write("." + notice.rule);
                }
                this.writer.write(")");
            }
            this.writer.write("\n");
        }
    }
};

module.exports = Reporter;
