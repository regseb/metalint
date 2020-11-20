/**
 * Le formateur qui écrit les résultats avec des phrases en français.
 */
export const Formatter = class {

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
    }

    /**
     * Affiche les éventuelles notifications d'un fichier.
     *
     * @param {string}         file    Le fichier analysé.
     * @param {Array.<Object>} notices La liste des notifications ou
     *                                 <code>null</code>.
     */
    notify(file, notices) {
        // Si le fichier n'a pas été vérifié (car il ne rentrait pas dans
        // les critères des checkers).
        if (null === notices) {
            return;
        }

        for (const notice of notices) {
            this.writer.write("Le linter " + notice.linter + " a trouvé ");
            if (null === notice.rule) {
                this.writer.write("un problème ");
            } else {
                this.writer.write("que la règle " + notice.rule +
                                  " n'est pas respectée ");
            }
            if (0 === notice.locations.length) {
                this.writer.write("dans le fichier ");
            } else {
                this.writer.write("à la ligne " +
                                  notice.locations[0].line.toString() +
                                  " du fichier ");
            }
            this.writer.write(file + " : " + notice.message + "\n");
        }
    }

    /**
     * Finalise l'affichage.
     */
    finalize() {
        // Ne rien faire.
    }
};
