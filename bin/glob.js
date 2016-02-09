/* global require, module, process */

"use strict";

const fs        = require("fs");
const path      = require("path");
const globby    = require("globby");
const minimatch = require("minimatch");

/**
 * Vérifier si un fichier respecte un des patrons.
 *
 * @param {string}         file     L'adresse du fichier qui sera vérifié.
 * @param {Array.<string>} patterns La liste des patrons.
 * @param {boolean}        hidden   La marque pour indiquer s'il faut vérifier
 *                                  les fichiers cachés.
 * @param {string}         root     L'adresse du répertoire où se trouve le
 *                                  dossier <code>.metalint/</code>.
 * @return {boolean} <code>true</code> si le fichier respectent au moins un
 *                   patron ; sinon <code>false</code>.
 */
const match = function (file, patterns, hidden, root) {
    const todo = path.relative(root, path.join(process.cwd(), file));
    let matched = false;
    for (const pattern of patterns) {
        if ("!" !== pattern[0]) {
            if (minimatch(todo, pattern, { "dot": hidden })) {
                matched = true;
            }
        } else if (!minimatch(todo, pattern, { "dot": hidden })) {
            return false;
        }
    }
    return matched;
}; // match()

/**
 * Récupérer toute l'arborescence des fichiers respectant un des patrons.
 *
 * @param {string}         file     L'adresse du fichier / répertoire servant de
 *                                  racine pour l'arborescence ou
 *                                  <code>null</code> pour utiliser le
 *                                  répertoire courant.
 * @param {Array.<string>} patterns La liste des patrons.
 * @param {boolean}        hidden   La marque pour indiquer s'il faut vérifier
 *                                  les fichiers cachés.
 * @param {string}         root     L'adresse du répertoire où se trouve le
 *                                  dossier <code>.metalint/</code>.
 * @return {Array.<string>} La liste des fichiers respectant un des patrons.
 */
const walk = function (file, patterns, hidden, root) {
    if (null === file) {
        return globby.sync(patterns, { "root":  root,
                                       "nodir": true,
                                       "dot":   hidden });
    }
    if (fs.lstatSync(file).isDirectory()) {
        const files = globby.sync([path.relative(root, file) + "/**"],
                                  { "root":  root,
                                    "nodir": true,
                                    "dot":   hidden });
        return files.filter(function (subfile) {
            return match(subfile, patterns, hidden, root);
        });
    }
    if (match(file, patterns, hidden, root)) {
        return [file];
    }
    return [];
}; // walk()

module.exports = { walk, match };
