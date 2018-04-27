"use strict";

const None = require("./none");

/**
 * Le rapporteur qui écrit les résultats brut (au format JSON). La verbosité est
 * utilisée pour l’indentation, avec :
 * <ul>
 *   <li><code>0</code> : le résultat n’est pas indenté ;
 *   <li><code>1</code> : il est indenté avec une espace ;
 *   <li><code>2</code> : deux espaces sont utilisées ;
 *   <li>...</li>
 * </ul>
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
        super.notify(file, notices);

        this.results[file] = notices;
    }

    /**
     * Affiche les résultats.
     *
     * @return {number} La sévérité la plus élévée des résultats.
     */
    finalize() {
        // Afficher l’objet JSON.
        this.writer.write(JSON.stringify(this.results, null, this.verbose));
        this.writer.write("\n");

        return super.finalize();
    }
};

module.exports = Reporter;
