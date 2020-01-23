/**
 * @module
 */

"use strict";

const fs   = require("fs");
const path = require("path");

/**
 * Protège les caractères spéciaux des expressions rationnelles.
 *
 * @param {string} pattern Les caractères.
 * @returns {string} Les caractères protégés.
 */
const sanitize = function (pattern) {
    return pattern.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
};

/**
 * Transforme un patron en expression rationnelle.
 *
 * @param {string} pattern Le patron.
 * @returns {object} La marque pour la négation et l'expression rationnelle.
 */
const compile = function (pattern) {
    const negate = pattern.startsWith("!");
    const glob = pattern.replace(/^!/u, "");
    let regexp = glob.startsWith("/") ? "^"
                                      : "^(.*/)?";

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
                    throw new Error(pattern + ": '**' not followed by a" +
                                    " slash.");
                }
            } else {
                regexp += "/";
            }
        } else if ("*" === glob[i]) {
            // Si c'est le dernier caractère ou qu'il n'est pas suivi par une
            // étoile.
            if (glob.length === i + 1 || "*" !== glob[i + 1]) {
                regexp += "[^/]*";
            // Sinon : ce n'est pas le dernier caractère et le prochain est
            // une étoile.
            } else if (0 === i) {
                regexp += ".*";
                ++i;
            } else {
                throw new Error(pattern + ": '**' not preceded by a slash.");
            }
        } else if ("?" === glob[i]) {
            regexp += "[^/]";
        } else if ("[" === glob[i]) {
            const closing = glob.indexOf("]", i);
            if (-1 === closing) {
                throw new Error(pattern + ": ']' missing.");
            }
            regexp += "[" + sanitize(glob.slice(i + 1, closing)) + "]";
            i = closing;
        } else {
            regexp += sanitize(glob[i]);
        }
    }

    if (negate) {
        if (regexp.endsWith("/")) {
            regexp += ".*";
        } else {
            regexp += "(/.*)?";
        }
    } else if (!regexp.endsWith("/")) {
        regexp += "/?";
    }
    regexp += "$";

    return { negate, "regexp": new RegExp(regexp, "u") };
};

/**
 * Teste si un fichier respecte un des patrons.
 *
 * @param {string}         file      L'adresse du fichier qui sera vérifié.
 * @param {Array.<object>} patterns  La liste des patrons.
 * @param {string}         root      L'adresse du répertoire où se trouve le
 *                                   dossier <code>.metalint/</code>.
 * @param {boolean}        directory La marque indiquant si le fichier est un
 *                                   répertoire.
 * @returns {string} <code>"MATCHED"</code> si le fichier respecte au moins un
 *                   patron ; <code>"NEGATE"</code> si le fichier ne respecte
 *                   pas un patron négatif ; sinon <code>"NONE"</code>.
 */
const exec = function (file, patterns, root, directory) {
    const relative = "/" + path.relative(root, path.join(process.cwd(), file)) +
                     (directory ? "/" : "");

    let result = "NONE";
    for (const pattern of patterns) {
        if (pattern.negate) {
            if (pattern.regexp.test(relative)) {
                return "NEGATE";
            }
        } else if ("NONE" === result && pattern.regexp.test(relative)) {
            result = "MATCHED";
        }
    }
    return result;
};

/**
 * Récupère toute l'arborescence des fichiers respectant un des patrons.
 *
 * @param {string}         base     Le fichier / répertoire servant de racine
 *                                  pour l'arborescence.
 * @param {Array.<string>} patterns La liste des patrons compilés.
 * @param {string}         root     L'adresse du répertoire où se trouve le
 *                                  dossier <code>.metalint/</code>.
 * @returns {Array.<string>} La liste des fichiers respectant un des patrons.
 */
const deep = function (base, patterns, root) {
    const directory = fs.lstatSync(base).isDirectory();
    const result = exec(base, patterns, root, directory);
    if ("NEGATE" === result) {
        return [];
    }

    const files = [];
    if ("MATCHED" === result) {
        files.push(base);
    }
    if (directory) {
        for (const file of fs.readdirSync(base)) {
            files.push(...deep(path.join(base, file), patterns, root));
        }
    }
    return files;
};

/**
 * Vérifie si un fichier respecte un des patrons.
 *
 * @param {string}         file      L'adresse du fichier qui sera vérifié.
 * @param {Array.<string>} patterns  La liste des patrons.
 * @param {string}         root      L'adresse du répertoire où se trouve le
 *                                   dossier <code>.metalint/</code>.
 * @param {boolean}        directory La marque indiquant si le fichier est un
 *                                   répertoire.
 * @returns {boolean} <code>true</code> si le fichier respectent au moins un
 *                    patron ; sinon <code>false</code>.
 */
const test = function (file, patterns, root, directory) {
    return "MATCHED" === exec(file, patterns.map(compile), root, directory);
};

/**
 * Récupère toute l'arborescence des fichiers respectant un des patrons.
 *
 * @param {Array.<string>}          bases    La liste des fichiers / répertoires
 *                                           servant de racine pour
 *                                           l'arborescence.
 * @param {(Array.<string>|string)} patterns La liste des patrons.
 * @param {string}                  root     L'adresse du répertoire où se
 *                                           trouve le dossier
 *                                           <code>.metalint/</code>.
 * @returns {Array.<string>} La liste des fichiers respectant un des patrons.
 */
const walk = function (bases, patterns, root) {
    const compileds = Array.isArray(patterns) ? patterns.map(compile)
                                              : [patterns].map(compile);

    if (0 === bases.length) {
        return deep(".", compileds, root);
    }

    const files = [];
    for (const base of bases) {
        files.push(...deep(base, compileds, root));
    }
    return files;
};

module.exports = { test, walk };
