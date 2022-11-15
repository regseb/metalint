/**
 * @module
 */

import SEVERITY from "../severity.js";

/**
 * @typedef {NodeJS.WritableStream} WritableStream
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Convertit les caractères spéciaux (<em>&amp;</em>, <em>&lt;</em>,
 * <em>&gt;</em>, <em>'</em> et <em>"</em>) en entités.
 *
 * @param {string} input Le texte qui sera converti.
 * @returns {string} Le texte converti.
 */
const encode = function (input) {
    const ENTITIES = {
        "&":  "&amp;",
        "<":  "&lt;",
        ">":  "&gt;",
        "'":  "&apos;",
        "\"": "&quot;",
    };
    let output = input;
    for (const [character, entity] of Object.entries(ENTITIES)) {
        output = output.replace(new RegExp(character, "gu"), entity);
    }
    return output;
};

/**
 * Indente le texte si le niveau de verbosité est supérieure ou égal à
 * <code>1</code>.
 *
 * @param {number}         depth  La profondeur de l'indentation.
 * @param {WritableStream} writer Le flux où écrire l'indentation.
 * @param {number}         size   La taille des indentations (en espace) ou
 *                                <code>-1</code> pour ne pas mettre de retour à
 *                                la ligne.
 */
const shift = function (depth, writer, size) {
    if (-1 !== size) {
        writer.write("\n" + " ".repeat(depth * size));
    }
};

/**
 * Le formateur qui écrit les résultats dans le format de
 * <strong>checkstyle</strong>.
 */
export const Formatter = class {

    /**
     * Le niveau de sévérité minimum des notifications affichées.
     *
     * @type {number}
     */
    #level;

    /**
     * Le flux où écrire les résultats.
     *
     * @type {WritableStream}
     */
    #writer;

    /**
     * La taille des indentations (en espace) ou <code>-1</code> pour ne pas
     * mettre de retour à la ligne.
     *
     * @type {number}
     */
    #indent;

    /**
     * Crée un formateur.
     *
     * @param {number}         level            Le niveau de sévérité minimum
     *                                          des notifications affichées.
     * @param {WritableStream} writer           Le flux où écrire les résultats.
     * @param {Object}         options          Les options du formateur.
     * @param {number}         [options.indent] La taille des indentations (en
     *                                          espace) ou <code>-1</code> (par
     *                                          défaut) pour ne pas mettre de
     *                                          retour à la ligne.
     */
    constructor(level, writer, options) {
        this.#level  = level;
        this.#writer = writer;
        this.#indent = options.indent ?? -1;

        this.#writer.write(`<?xml version="1.0" encoding="UTF-8"?>`);
        shift(0, this.#writer, this.#indent);
        this.#writer.write(`<checkstyle version="8.28">`);
    }

    /**
     * Affiche les éventuelles notifications d'un fichier.
     *
     * @param {string}             file    Le fichier analysé.
     * @param {Notice[]|undefined} notices La liste des notifications ou
     *                                     <code>undefined</code>.
     */
    notify(file, notices) {
        // Si le fichier n'a pas été vérifié (car il ne rentrait pas dans les
        // critères des checkers).
        if (undefined === notices) {
            return;
        }

        shift(1, this.#writer, this.#indent);
        this.#writer.write(`<file name="${file}">`);
        for (const notice of notices.filter((n) => this.#level >= n.severity)) {
            shift(2, this.#writer, this.#indent);
            this.#writer.write("<error");

            if (0 !== notice.locations.length) {
                this.#writer.write(` line="${notice.locations[0].line}"`);
                if ("column" in notice.locations[0]) {
                    this.#writer.write(` column="` +
                                       `${notice.locations[0].column}"`);
                }
            }

            this.#writer.write(` severity="`);
            switch (notice.severity) {
                case SEVERITY.FATAL: case SEVERITY.ERROR:
                    this.#writer.write("error");
                    break;
                case SEVERITY.WARN:
                    this.#writer.write("warning");
                    break;
                default:
                    this.#writer.write("info");
            }
            this.#writer.write(`"`);

            this.#writer.write(` message="${encode(notice.message)}"`);

            this.#writer.write(` source="${encode(notice.linter)}`);
            if (undefined !== notice.rule) {
                this.#writer.write(`.${encode(notice.rule)}`);
            }
            this.#writer.write(`" />`);
        }
        shift(1, this.#writer, this.#indent);
        this.#writer.write("</file>");
    }

    /**
     * Finalise l'affichage.
     *
     * @returns {Promise<void>} La promesse indiquant que tous les textes sont
     *                          écrits.
     */
    finalize() {
        shift(0, this.#writer, this.#indent);
        return new Promise((resolve) => {
            this.#writer.write("</checkstyle>\n", "utf8", resolve);
        });
    }
};
