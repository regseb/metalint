"use strict";

const fs        = require("fs");
const path      = require("path");
const glob      = require("glob");
const minimatch = require("minimatch");

/**
 * Vérifier si un fichier respecte un des patrons.
 *
 * @param {string}         file     L’adresse du fichier qui sera vérifié.
 * @param {Array.<string>} patterns La liste des patrons.
 * @param {boolean}        hidden   La marque pour indiquer s’il faut vérifier
 *                                  les fichiers cachés.
 * @param {string}         root     L’adresse du répertoire où se trouve le
 *                                  dossier <code>.metalint/</code>.
 * @param {string}         cwd      L’adresse du répertoire courant.
 * @return {boolean} <code>true</code> si le fichier respectent au moins un
 *                   patron ; sinon <code>false</code>.
 */
const match = function (file, patterns, hidden, root, cwd) {
    const relative = path.relative(root, path.join(cwd, file));
    let matched = false;
    for (const pattern of patterns) {
        if ("!" !== pattern[0]) {
            if (!matched && minimatch(relative, pattern, { "dot": hidden })) {
                matched = true;
            }
        } else if (!minimatch(relative, pattern, { "dot": hidden })) {
            return false;
        }
    }
    return matched;
}; // match()

/**
 * Récupérer toute l’arborescence des fichiers respectant un des patrons.
 *
 * @param {string}         bases    La liste des fichiers / répertoires servant
 *                                  de racine pour l’arborescence.
 * @param {Array.<string>} patterns La liste des patrons.
 * @param {boolean}        hidden   La marque pour indiquer s’il faut vérifier
 *                                  les fichiers cachés.
 * @param {string}         root     L’adresse du répertoire où se trouve le
 *                                  dossier <code>.metalint/</code>.
 * @return {Array.<string>} La liste des fichiers respectant un des patrons.
 */
const walk = function (bases, patterns, hidden, root) {
    // Récupérer tous les fichiers des arborescences.
    let files = [];
    const options = {
        "root":  root,
        "nodir": true,
        "dot":   hidden
    };
    for (const base of bases) {
        if (null === base || "" === path.relative(root, base)) {
            files = files.concat(glob.sync("**", options));
        } else if (fs.lstatSync(base).isDirectory()) {
            files = files.concat(glob.sync(path.relative(root, base) + "/**",
                                           options));
        } else {
            files.push(base);
        }
    }

    // Supprimer les doublons et filtrer selon les patrons.
    return files.filter(function (file, index, self) {
        return self.indexOf(file) === index &&
               match(file, patterns, hidden, root, process.cwd());
    });
}; // walk()

module.exports = { match, walk };
