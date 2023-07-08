/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import path from "node:path/posix";
import process from "node:process";
import { wrap } from "./array.js";

/**
 * Protège les caractères spéciaux pour les expressions rationnelles.
 *
 * @param {string} pattern Une chaine de caractères.
 * @returns {string} La chaine de caractères avec les caractères spéciaux
 *                   protégés.
 */
const sanitize = function (pattern) {
    return pattern.replaceAll(/[$()*+.?[\\\]^{|}]/gu, "\\$&");
};

/**
 * Inverse un patron (en enlevant ou ajoutant un <code>!</code> en début).
 *
 * @param {string} pattern Le patron.
 * @returns {string} L'inverse du patron.
 */
const reverse = function (pattern) {
    return pattern.startsWith("!") ? pattern.slice(1) : `!${pattern}`;
};

/**
 * Transforme un patron en expression rationnelle.
 *
 * @param {string} pattern Le patron.
 * @returns {RegExp} L'expression rationnelle issue du patron.
 * @throws {Error} Si le patron est invalide.
 */
const compile = function (pattern) {
    const glob = pattern.replace(/^!/u, "");
    let regexp = glob.startsWith("/") ? "^" : "^(.*/)?";

    for (let i = 0; i < glob.length; ++i) {
        if ("/" === glob[i]) {
            if ("/**/" === glob.slice(i, i + 4)) {
                regexp += "/(.*/)?";
                i += 3;
            } else if ("/**" === glob.slice(i, i + 3)) {
                if (glob.length === i + 3) {
                    regexp += "/.*";
                    i += 2;
                } else {
                    throw new Error(
                        `${pattern}: '**' not followed by a slash.`,
                    );
                }
            } else {
                regexp += "/";
            }
        } else if ("*" === glob[i]) {
            // Si c'est le dernier caractère ou qu'il n'est pas suivi par une
            // étoile.
            if (glob.length === i + 1 || "*" !== glob[i + 1]) {
                regexp += "[^/]+";
                // Sinon : Le prochain est une étoile et les doubles étoiles
                // sont en début du patron.
            } else if (0 === i) {
                regexp += ".*";
                ++i;
            } else {
                throw new Error(`${pattern}: '**' not preceded by a slash.`);
            }
        } else if ("?" === glob[i]) {
            regexp += "[^/]";
        } else if ("[" === glob[i]) {
            const closing = glob.indexOf("]", i);
            if (-1 === closing) {
                throw new Error(`${pattern}: ']' missing.`);
            }
            regexp += "[" + sanitize(glob.slice(i + 1, closing)) + "]";
            i = closing;
        } else if ("{" === glob[i]) {
            const closing = glob.indexOf("}", i);
            if (-1 === closing) {
                throw new Error(`${pattern}: '}' missing.`);
            }
            regexp +=
                "(" +
                sanitize(glob.slice(i + 1, closing)).replaceAll(",", "|") +
                ")";
            i = closing;
        } else {
            regexp += sanitize(glob[i]);
        }
    }
    regexp += "$";

    return new RegExp(regexp, "u");
};

/**
 * Le développeur de motif.
 *
 * @see https://en.wikipedia.org/wiki/Glob_(programming)
 */
export default class Glob {
    /**
     * La liste des expressions rationnelles négatives qui couvrent des
     * répertoires ainsi que leurs fichiers.
     *
     * @type {RegExp[]}
     */
    #deepNegatives = [];

    /**
     * La liste des expressions rationnelles négatives qui vérifie des fichiers
     * ou des répertoires (mais sans exclure leurs fichiers).
     *
     * @type {RegExp[]}
     */
    #negatives = [];

    /**
     * La liste des expressions rationnelles positives listant les fichiers ou
     * répertoires à retourner.
     *
     * @type {RegExp[]}
     */
    #positives = [];

    /**
     * Le chemin du répertoire courant.
     */
    #cwd;

    /**
     * Le chemin du répertoire où se trouve le répertoire
     * <code>.metalint/</code>.
     */
    #root;

    /**
     * Crée un développeur de motif.
     *
     * @param {string|string[]} patterns      Le ou les patrons.
     * @param {Object}          options       Les options du développeur de
     *                                        motif.
     * @param {string}          [options.cwd] Le chemin du répertoire courant.
     * @param {string}          options.root  Le chemin du répertoire où se
     *                                        trouve le répertoire
     *                                        <code>.metalint/</code>.
     */
    constructor(patterns, { cwd, root }) {
        for (const [i, pattern] of wrap(patterns).entries()) {
            // Si deux patrons opposés ("foo" et "!foo") sont présents : garder
            // seulement le dernier. Et enlever les doublons.
            if (
                patterns.indexOf(reverse(pattern)) > i ||
                patterns.lastIndexOf(pattern) !== i
            ) {
                continue;
            }
            const regex = compile(pattern);
            if (pattern.startsWith("!")) {
                if (pattern.endsWith("/**")) {
                    this.#deepNegatives.push(regex);
                } else {
                    this.#negatives.push(regex);
                }
            } else {
                this.#positives.push(regex);
            }
        }

        this.#cwd = cwd ?? process.cwd();
        this.#root = root;
    }

    /**
     * Teste si un fichier / répertoire respecte les patrons.
     *
     * @param {string} file Le chemin du fichier / répertoire  qui sera vérifié.
     * @returns {string} <code>"DEEP_NEGATIVE"</code> pour un répertoire ne
     *                   respectant pas un patron qui exclue aussi ses
     *                   fichiers ; <code>"NEGATIVE"</code> si le fichier /
     *                   répertoire ne respecte pas un patron négatif ;
     *                   <code>"POSITIVE"</code> si le fichier / répertoire
     *                   respecte un patron positif ; sinon
     *                   <code>"NEGATIVE"</code>.
     */
    #exec(file) {
        if (0 === this.#positives.length) {
            return "DEEP_NEGATIVE";
        }

        const relative =
            "./" === file
                ? "/"
                : "/" +
                  path.relative(this.#root, path.join(this.#cwd, file)) +
                  (file.endsWith("/") ? "/" : "");

        if (this.#deepNegatives.some((r) => r.test(relative))) {
            return "DEEP_NEGATIVE";
        }
        if (this.#negatives.some((r) => r.test(relative))) {
            return "NEGATIVE";
        }
        if (this.#positives.some((r) => r.test(relative))) {
            return "POSITIVE";
        }
        return "NEGATIVE";
    }

    /**
     * Vérifie si un fichier / répertoire respecte les patrons.
     *
     * @param {string} file Le chemin du fichier / répertoire qui sera vérifié.
     * @returns {boolean} <code>true</code> si le fichier / répertoire respecte
     *                    les patrons ; sinon <code>false</code>.
     */
    test(file) {
        return "POSITIVE" === this.#exec(file);
    }

    /**
     * Récupère toute l'arborescence d'un répertoire respectant les patrons.
     *
     * @param {string} base Le répertoire servant de racine pour l'arborescence.
     * @returns {Promise<string[]>} Une promesse contenant la liste des fichiers
     *                              / répertoires respectant les patrons.
     */
    async walk(base) {
        const result = this.#exec(base);
        if ("DEEP_NEGATIVE" === result) {
            return [];
        }

        const files = [];
        if ("POSITIVE" === result) {
            files.push(base);
        }
        // Si c'est un répertoire : parcourir ses fichiers.
        if (base.endsWith("/")) {
            const dirents = await fs.readdir(base, { withFileTypes: true });
            for (const dirent of dirents) {
                files.push(
                    ...(await this.walk(
                        path.join(base, dirent.name) +
                            (dirent.isDirectory() ? "/" : ""),
                    )),
                );
            }
        }
        return files;
    }
}
