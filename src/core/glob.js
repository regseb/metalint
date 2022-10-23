/**
 * @module
 */

import fs from "node:fs/promises";
import path from "node:path";

/**
 * Protège les caractères spéciaux pour les expressions rationnelles.
 *
 * @param {string} pattern Une chaine de caractères.
 * @returns {string} La chaine de caractères avec les caractères spéciaux
 *                   protégés.
 */
const sanitize = function (pattern) {
    return pattern.replace(/[$()*+.?[\\\]^{|}]/gu, "\\$&");
};

/**
 * Transforme un patron en expression rationnelle.
 *
 * @param {string} pattern Le patron.
 * @returns {Object} La marque pour la négation et l'expression rationnelle
 *                   issue du patron.
 * @throws {Error} Si le patron est invalide.
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
                    throw new Error(`${pattern}: '**' not followed by a` +
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
        } else {
            regexp += sanitize(glob[i]);
        }
    }

    if (negate) {
        regexp += regexp.endsWith("/") ? ".*"
                                       : "(/.*)?";
    } else if (!regexp.endsWith("/")) {
        regexp += "/?";
    }
    regexp += "$";

    return { negate, regexp: new RegExp(regexp, "u") };
};

/**
 * Teste si un fichier respecte un des patrons.
 *
 * @param {string}   file      L'adresse du fichier qui sera vérifié.
 * @param {Object[]} patterns  La liste des patrons.
 * @param {string}   root      L'adresse du répertoire où se trouve le dossier
 *                             <code>.metalint/</code>.
 * @param {boolean}  directory La marque indiquant si le fichier est un
 *                             répertoire.
 * @returns {string} <code>"MATCHED"</code> si le fichier respecte au moins un
 *                   patron ; <code>"NEGATE"</code> si le fichier ne respecte
 *                   pas un patron négatif ; sinon <code>"NONE"</code>.
 */
const exec = function (file, patterns, root, directory) {
    const relative = "." === file
        ? "/"
        : "/" + path.relative(root, path.join(process.cwd(), file)) +
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
 * @param {string}   base     Le fichier / répertoire servant de racine pour
 *                            l'arborescence.
 * @param {Object[]} patterns La liste des patrons compilés.
 * @param {string}   root     L'adresse du répertoire où se trouve le dossier
 *                            <code>.metalint/</code>.
 * @returns {Promise<string[]>} Une promesse contenant la liste des fichiers
 *                              respectant un des patrons.
 */
const deep = async function (base, patterns, root) {
    const stats = await fs.lstat(base);
    const directory = stats.isDirectory();
    const result = exec(base, patterns, root, directory);
    if ("NEGATE" === result) {
        return [];
    }

    const files = [];
    if ("MATCHED" === result) {
        files.push(base);
    }
    if (directory) {
        for (const file of await fs.readdir(base)) {
            files.push(...await deep(path.join(base, file), patterns, root));
        }
    }
    return files;
};

/**
 * Vérifie si un fichier respecte un des patrons.
 *
 * @param {string}   file      L'adresse du fichier qui sera vérifié.
 * @param {string[]} patterns  La liste des patrons.
 * @param {string}   root      L'adresse du répertoire où se trouve le dossier
 *                             <code>.metalint/</code>.
 * @param {boolean}  directory La marque indiquant si le fichier est un
 *                             répertoire.
 * @returns {boolean} <code>true</code> si le fichier respectent au moins un
 *                    patron ; sinon <code>false</code>.
 */
const test = function (file, patterns, root, directory) {
    return "MATCHED" === exec(file, patterns.map(compile), root, directory);
};

/**
 * Récupère toute l'arborescence des fichiers respectant un des patrons.
 *
 * @param {string[]}          bases    La liste des fichiers / répertoires
 *                                     servant de racine pour l'arborescence.
 * @param {(string[]|string)} patterns La liste des patrons.
 * @param {string}            root     L'adresse du répertoire où se trouve le
 *                                     dossier <code>.metalint/</code>.
 * @returns {Promise<string[]>} Une promesse contenant la liste des fichiers
 *                              respectant un des patrons.
 */
const walk = async function (bases, patterns, root) {
    const compileds = Array.isArray(patterns) ? patterns.map(compile)
                                              : [patterns].map(compile);

    if (0 === bases.length) {
        return deep(".", compileds, root);
    }

    const files = [];
    for (const base of bases) {
        files.push(...await deep(base, compileds, root));
    }
    return files;
};

export default { test, walk };
