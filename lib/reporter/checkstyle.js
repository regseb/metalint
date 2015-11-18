/* global require, module */

"use strict";

let SEVERITY = require("../severity");

/**
 * Convertir les caractères spéciaux (<em>&amp;</em>, <em>&lt;</em>,
 * <em>&gt;</em>, <em>'</em> et <em>"</em>) en entités.
 *
 * @param {string} value Le texte qui sera converti.
 * @return {string} Le texte converti.
 */
let encode = function (value) {
    let ENTITIES = {
        "&":  "&amp;",
        "<":  "&lt;",
        ">":  "&gt;",
        "'":  "&apos;",
        "\"": "&quot;"
    };
    for (let entity in ENTITIES) {
        value = value.replace(new RegExp(entity, "g"), ENTITIES[entity]);
    }
    return value;
}; // encode()

/**
 * Indenter le texte si le niveau de verbosité est supérieure ou égal à
 * <code>1</code>.
 *
 * @param {number} depth   La profondeur de l'indentation.
 * @param {Object} writer  Le flux où écrire l'indentation.
 * @param {number} verbose Le niveau de verbosité.
 */
let indent = function (depth, writer, verbose) {
    if (0 === verbose) {
        return;
    }
    writer.write("\n" + Array(depth * 2 + 1).join(" "));
}; // indent()

/**
 * Écrire les résultats dans le format de <strong>checkstyle</strong>. Avec une
 * verbosité à <code>1</code> : le résultat est indenté.
 *
 * @param {Object} results La liste des résultats regroupés par fichier.
 * @param {Object} writer  Le flux où écrire les résultats.
 * @param {number} verbose Le niveau de verbosité.
 * @return {number} La sévérité la plus élévée des résultats.
 */
let reporter = function (results, writer, verbose) {
    let severity = null;
    writer.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    indent(0, writer, verbose);
    writer.write("<checkstyle version=\"6.8\">");
    for (let file in results) {
        // Si le fichier n'a pas été vérifié (car il ne rentrait pas dans les
        // critères des checkers).
        if (null === results[file]) {
            continue;
        }

        indent(1, writer, verbose);
        writer.write("<file name=\"" + file + "\">");
        for (let notice of results[file]) {
            // Déterminer la sévérité la plus élévée des résultats.
            if (null === severity || severity > notice.severity) {
                severity = notice.severity;
            }

            indent(2, writer, verbose);
            writer.write("<error");

            if (null !== notice.locations) {
                writer.write(" line=\"" + notice.locations[0].line + "\"");
                if ("column" in notice.locations[0]) {
                    writer.write(" column=\"" + notice.locations[0].column +
                                 "\"");
                }
            }

            writer.write(" severity=\"");
            switch (notice.severity) {
                case SEVERITY.FATAL: writer.write("error");   break;
                case SEVERITY.ERROR: writer.write("error");   break;
                case SEVERITY.WARN:  writer.write("warning"); break;
                case SEVERITY.INFO:  writer.write("info");    break;
            }
            writer.write("\"");

            writer.write(" message=\"" + encode(notice.message) + "\"");

            writer.write(" source=\"" + encode(notice.linter));
            if (null !== notice.rule) {
                writer.write("." + encode(notice.rule));
            }
            writer.write("\" />");
        }
        indent(1, writer, verbose);
        writer.write("</file>");
    }
    indent(0, writer, verbose);
    writer.write("</checkstyle>\n");

    return severity;
}; // reporter()

module.exports = reporter;
