"use strict";

const SEVERITY = require("../severity");
const None     = require("./none");

/**
 * Convertit les caractères spéciaux (<em>&amp;</em>, <em>&lt;</em>,
 * <em>&gt;</em>, <em>'</em> et <em>"</em>) en entités.
 *
 * @param {string} input Le texte qui sera converti.
 * @return {string} Le texte converti.
 */
const encode = function (input) {
    const ENTITIES = {
        "&":  "&amp;",
        "<":  "&lt;",
        ">":  "&gt;",
        "'":  "&apos;",
        "\"": "&quot;"
    };
    let output = input;
    for (const entity in ENTITIES) {
        output = output.replace(new RegExp(entity, "g"), ENTITIES[entity]);
    }
    return output;
};

/**
 * Indente le texte si le niveau de verbosité est supérieure ou égal à
 * <code>1</code>.
 *
 * @param {number} depth   La profondeur de l’indentation.
 * @param {Object} writer  Le flux où écrire l’indentation.
 * @param {number} verbose Le niveau de verbosité.
 */
const indent = function (depth, writer, verbose) {
    if (0 === verbose) {
        return;
    }
    writer.write("\n" + Array(depth * verbose + 1).join(" "));
};

/**
 * Le rapporteur qui écrit les résultats dans le format de
 * <strong>checkstyle</strong>. La verbosité est utilisée pour l’indentation,
 * avec :
 * <ul>
 *   <li><code>0</code> : le résultat n’est pas indenté ;
 *   <li><code>1</code> : il est indenté avec une espace ;
 *   <li><code>2</code> : deux espaces sont utilisés ;
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

        this.writer.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        indent(0, this.writer, this.verbose);
        this.writer.write("<checkstyle version=\"6.8\">");
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

        indent(1, this.writer, this.verbose);
        this.writer.write("<file name=\"" + file + "\">");
        for (const notice of notices) {
            indent(2, this.writer, this.verbose);
            this.writer.write("<error");

            if (0 !== notice.locations.length) {
                this.writer.write(" line=\"" + notice.locations[0].line + "\"");
                if ("column" in notice.locations[0]) {
                    this.writer.write(" column=\"" +
                                      notice.locations[0].column + "\"");
                }
            }

            this.writer.write(" severity=\"");
            switch (notice.severity) {
                case SEVERITY.FATAL: case SEVERITY.ERROR:
                    this.writer.write("error");
                    break;
                case SEVERITY.WARN:
                    this.writer.write("warning");
                    break;
                case SEVERITY.INFO:
                    this.writer.write("info");
            }
            this.writer.write("\"");

            this.writer.write(" message=\"" + encode(notice.message) + "\"");

            this.writer.write(" source=\"" + encode(notice.linter));
            if (null !== notice.rule) {
                this.writer.write("." + encode(notice.rule));
            }
            this.writer.write("\" />");
        }
        indent(1, this.writer, this.verbose);
        this.writer.write("</file>");
    }

    /**
     * Finalise l'affichage.
     *
     * @return {number} La sévérité la plus élévée des résultats.
     */
    finalize() {
        indent(0, this.writer, this.verbose);
        this.writer.write("</checkstyle>\n");

        return super.finalize();
    }
};

module.exports = Reporter;
