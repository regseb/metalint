/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import process from "node:process";
import chalk from "chalk";
import Severities from "../severities.js";
import Formatter from "./formatter.js";

/**
 * @typedef {import("node:stream").Writable} Writable
 * @typedef {import("../../type/index.js").Level} Level
 * @typedef {import("../../type/index.js").Location} Location
 * @typedef {import("../../type/index.js").Notice} Notice
 * @typedef {import("../../type/index.js").Severity} Severity
 */

/**
 * Écrit un message avec un style / couleur.
 *
 * @param {Writable} writer  Le flux où afficher le message.
 * @param {string}   message Le message qui sera affiché.
 * @param {string}   [style] Le code du style.
 */
const print = function (writer, message, style) {
    let line;
    if (process.stdout === writer) {
        switch (style) {
            case "BOLD":
                line = chalk.bold(message);
                break;
            case "MAGENTA":
                line = chalk.magenta(message);
                break;
            case "RED":
                line = chalk.red(message);
                break;
            case "YELLOW":
                line = chalk.yellow(message);
                break;
            case "BLUE":
                line = chalk.blue(message);
                break;
            default:
                line = message;
        }
    } else {
        line = message;
    }
    writer.write(line);
};

/**
 * Écrit une ligne du code source.
 *
 * @param {number}   line    Le numéro de la ligne.
 * @param {string[]} content Toutes les lignes du fichier.
 * @param {boolean}  active  La marque indiquant si le problème est dans cette
 *                           ligne.
 * @param {Writable} writer  Le flux où afficher la ligne.
 */
const printCodeSourceLine = function (line, content, active, writer) {
    // Vérifier que le numéro de la ligne demandée existe dans le fichier.
    if (0 < line && line <= content.length) {
        print(writer, line.toString().padStart(5) + (active ? "‖" : "|"));
        if (0 !== content[line - 1].length) {
            print(writer, ` ${content[line - 1]}`);
        }
        print(writer, "\n");
    }
};

/**
 * Écrit le code source proche des lieux où le problème a été trouvé.
 *
 * @param {Location[]} locations Les positions, dans le code source, du
 *                               problème.
 * @param {string[]}   content   Toutes les lignes du fichier.
 * @param {Writable}   writer    Le flux où afficher les lignes incriminées.
 */
const printCodeSource = function (locations, content, writer) {
    const characters = [];
    for (const location of locations) {
        let i;
        for (i = 0; i < characters.length; ++i) {
            if (characters[i].line === location.line) {
                if (undefined !== location.column) {
                    characters[i].columns.push(location.column);
                    characters[i].columns.sort();
                }
                break;
            }
        }
        if (characters.length === i) {
            characters[i] = {
                line: location.line,
                columns: [],
            };
            if (undefined !== location.column) {
                characters[i].columns.push(location.column);
                characters[i].columns.sort();
            }
        }
    }
    characters.sort((a, b) => a.line - b.line);

    for (const { line, columns } of characters) {
        printCodeSourceLine(line - 2, content, false, writer);
        printCodeSourceLine(line - 1, content, false, writer);
        printCodeSourceLine(line, content, true, writer);
        if (0 !== columns.length) {
            let dashs = "-".repeat(6 + columns.at(-1));
            for (const column of columns) {
                dashs =
                    dashs.slice(0, 6 + column) +
                    "^" +
                    dashs.slice(6 + column + 1);
            }
            print(writer, dashs + "\n");
        }
        printCodeSourceLine(line + 1, content, false, writer);
        printCodeSourceLine(line + 2, content, false, writer);
    }
};

/**
 * Le formateur qui écrit les résultats dans un format adapté pour la console.
 */
export default class ConsoleFormatter extends Formatter {
    /**
     * Le flux où écrire les résultats.
     *
     * @type {Writable}
     */
    #writer;

    /**
     * La marque indiquant s'il faut afficher les fichiers sans notification.
     *
     * @type {boolean}
     */
    #showZeroNotice;

    /**
     * La marque indiquant s'il faut afficher les fichiers non-analysés.
     *
     * @type {boolean}
     */
    #showNoChecked;

    /**
     * Crée un formateur.
     *
     * @param {Level}    level                    Le niveau de sévérité minimum
     *                                            des notifications affichées.
     * @param {Object}   options                  Les options du formateur.
     * @param {Writable} [options.writer]         Le flux où écrire les
     *                                            résultats.
     * @param {boolean}  [options.showZeroNotice] La marque indiquant s'il faut
     *                                            afficher les fichiers sans
     *                                            notification.
     * @param {boolean}  [options.showNoChecked]  Le marque indiquant s'il faut
     *                                            afficher les fichiers
     *                                            non-analysés.
     */
    constructor(level, options) {
        super(level);
        this.#writer = options.writer ?? process.stdout;
        this.#showZeroNotice = options.showZeroNotice ?? false;
        this.#showNoChecked = options.showNoChecked ?? false;
    }

    /**
     * Affiche les éventuelles notifications d'un fichier.
     *
     * @param {string}             file    Le fichier analysé.
     * @param {Notice[]|undefined} notices La liste des notifications ou
     *                                     <code>undefined</code>.
     * @returns {Promise<void>} La promesse indiquant que les notifications ont
     *                          été traitées.
     */
    async notify(file, notices) {
        // Si le fichier n'a pas été vérifié (car il ne rentrait pas dans les
        // critères des checkers).
        if (undefined === notices) {
            if (this.#showNoChecked) {
                print(this.#writer, `${file}: No checked.`, "BOLD");
                print(this.#writer, "\n\n");
            }
            return;
        }
        if (!notices.some((n) => this.level >= n.severity)) {
            if (this.#showZeroNotice) {
                print(this.#writer, `${file}: 0 notice.`, "BOLD");
                print(this.#writer, "\n\n");
            }
            return;
        }

        const counts = {
            [Severities.FATAL]: 0,
            [Severities.ERROR]: 0,
            [Severities.WARN]: 0,
            [Severities.INFO]: 0,
        };

        for (const notice of notices.filter((n) => this.level >= n.severity)) {
            counts[notice.severity] += 1;
        }

        let line = file + ": ";
        if (0 < counts[Severities.FATAL]) {
            line += `${counts[Severities.FATAL]} fatal`;
            if (1 < counts[Severities.FATAL]) {
                line += "s";
            }
            line += ", ";
        }
        if (0 < counts[Severities.ERROR]) {
            line += `${counts[Severities.ERROR]} error`;
            if (1 < counts[Severities.ERROR]) {
                line += "s";
            }
            line += ", ";
        }
        if (0 < counts[Severities.WARN]) {
            line += `${counts[Severities.WARN]} warning`;
            if (1 < counts[Severities.WARN]) {
                line += "s";
            }
            line += ", ";
        }
        if (0 < counts[Severities.INFO]) {
            line += `${counts[Severities.INFO]} info`;
            if (1 < counts[Severities.INFO]) {
                line += "s";
            }
            line += ", ";
        }
        line = line.slice(0, -2) + ".";
        print(this.#writer, line, "BOLD");
        print(this.#writer, "\n");

        // Récupérer le code source du fichier si ce n'est pas un répertoire et
        // s'il existe (s'il n'est pas dans une archive par exemple).
        let content;
        try {
            if (!file.endsWith("/")) {
                const buffer = await fs.readFile(file, "utf8");
                content = buffer.split("\n");
            }
        } catch (err) {
            if ("ENOTDIR" !== err.code) {
                throw err;
            }
        }

        for (const notice of notices.filter((n) => this.level >= n.severity)) {
            switch (notice.severity) {
                case Severities.FATAL:
                    print(this.#writer, "FATAL", "MAGENTA");
                    break;
                case Severities.ERROR:
                    print(this.#writer, "ERROR", "RED");
                    break;
                case Severities.WARN:
                    print(this.#writer, "WARN ", "YELLOW");
                    break;
                case Severities.INFO:
                    print(this.#writer, "INFO ", "BLUE");
                    break;
                default:
                    print(this.#writer, "      ");
            }
            print(this.#writer, `: ${notice.message} (${notice.linter}`);
            if (undefined !== notice.rule) {
                print(this.#writer, `.${notice.rule}`);
            }
            print(this.#writer, ")\n");

            if (undefined !== content) {
                printCodeSource(notice.locations, content, this.#writer);
            }

            print(this.#writer, "\n");
        }
    }

    /**
     * Finalise les résultats.
     *
     * @returns {Promise<void>} La promesse indiquant que les résultats ont été
     *                          finalisés.
     */
    finalize() {
        return new Promise((resolve) => {
            this.#writer.write("", () => resolve());
        });
    }
}
