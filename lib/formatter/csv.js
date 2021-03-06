/**
 * @module
 */

/**
 * @typedef {NodeJS.WritableStream} WritableStream
 * @typedef {import("../types").Notice} Notice
 */

/**
 * Protège une chaîne de caractères en l'entourant de guillemets et en doublant
 * les guillemets.
 *
 * @param {string} value Le texte qui sera protégé.
 * @returns {string} Le texte protégé.
 */
const doublequote = function (value) {
    return `"` + value.replace(/"/gu, `""`) + `"`;
};

/**
 * Le formateur qui écrit les résultats dans un format CSV.
 *
 * @see https://tools.ietf.org/html/rfc4180
 */
export const Formatter = class {

    /**
     * Crée un formateur.
     *
     * @param {number}         level  Le niveau de sévérité minimum des
     *                                notifications affichées.
     * @param {WritableStream} writer Le flux où écrire les résultats.
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
     * @param {string}      file    Le fichier analysé.
     * @param {?(Notice[])} notices La liste des notifications ou
     *                              <code>null</code>.
     */
    notify(file, notices) {
        // Si le fichier n'a pas été vérifié (car il ne rentrait pas dans les
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
     *
     * @returns {Promise} La promesse indiquant que tous les textes sont écrits.
     */
    finalize() {
        return new Promise((resolve) => {
            this.writer.write("", resolve);
        });
    }
};
