"use strict";

/**
 * Le rapporteur qui n'écrit pas les résultats et retourne seulement la sévérité
 * la plus élévée. Cette classe peut-être utilisé par d'autres rapporteurs pour
 * avoir les fonctionnalités de base : la sortie des résultats, le niveau de
 * verbosité et le calcul de la sévérité.
 */
const Reporter = class {

    /**
     * Crée un rapporteur.
     *
     * @param {Object} writer  Le flux où écrire les résultats.
     * @param {number} verbose Le niveau de verbosité.
     */
    constructor(writer, verbose) {
        this.writer   = writer;
        this.verbose  = verbose;
        this.severity = null;
    }

    /**
     * Calcule seulement la sévérité. Les notifications ne sont pas affichées.
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

        for (const notice of notices) {
            // Déterminer la sévérité la plus élévée des résultats.
            if (null === this.severity || this.severity > notice.severity) {
                this.severity = notice.severity;
            }
        }
    }

    /**
     * Retourne la sévérité la plus élévée des résultats.
     *
     * @return {number} La sévérité.
     */
    finalize() {
        return this.severity;
    }
};

module.exports = Reporter;
