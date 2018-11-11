/**
 * @module normalize
 */

"use strict";

const fs       = require("fs");
const path     = require("path");
const jsonlint = require("jsonlint");
const SEVERITY = require("./severity");

/**
 * La liste des formaters.
 *
 * @constant {Array.<string>} FORMATTERS
 */
const FORMATTERS = fs.readdirSync(path.join(__dirname, "formatter"));

/**
 * La liste des enrobages.
 *
 * @constant {Array.<string>} WRAPPERS
 */
const WRAPPERS = fs.readdirSync(path.join(__dirname, "wrapper"));

/**
 * Fusionne deux objets.
 *
 * @param {*} first  Le premier objet.
 * @param {*} second Le second objet.
 * @returns {*} La fusion des deux objets.
 */
const merge = function (first, second) {
    let third;

    if (Array.isArray(first) && Array.isArray(second)) {
        third = first.concat(second);
    } else if ("object" === typeof first  && !Array.isArray(first) &&
               "object" === typeof second && !Array.isArray(second)) {
        third = {};
        for (const key of new Set([...Object.keys(first),
                                   ...Object.keys(second)])) {
            // Si la propriété est dans les deux objets.
            if (key in first && key in second) {
                third[key] = merge(first[key], second[key]);
            // Si la propriété est seulement dans le premier objet.
            } else if (key in first) {
                third[key] = first[key];
            // Si la propriété est seulement dans le second objet.
            } else {
                third[key] = second[key];
            }
        }
    } else {
        third = second;
    }

    return third;
};

/**
 * Lit un fichier contenant un objet JSON.
 *
 * @param {string} file L’adresse du fichier qui sera lu.
 * @returns {Object} L’objet JSON récupéré.
 */
const read = function (file) {
    const json = fs.readFileSync(file, "utf-8");
    try {
        return jsonlint.parse(json);
    } catch (err) {
        throw new Error(file + ": " + err.message);
    }
};

/**
 * Normalise la propriété <code>"patterns"</code>.
 *
 * @param {*}              rotten           La valeur de la proptiété
 *                                          <code>"patterns"</code>.
 * @param {Array.<string>} auto             La valeur par défaut.
 * @param {Object}         [overwriting={}] Les valeurs passées dans la ligne de
 *                                          commande pour surcharger la
 *                                          configuration.
 * @returns {Array.<string>} La valeur normalisée.
 */
const patterns = function (rotten, auto, overwriting = {}) {
    const interim = "patterns" in overwriting ? overwriting.patterns
                                              : rotten;

    let standard;
    if (undefined === interim) {
        standard = auto;
    } else if ("string" === typeof interim) {
        standard = [interim];
    } else if (Array.isArray(interim)) {
        standard = interim;
    } else {
        throw new Error("property 'patterns' is incorrect type (string and" +
                        " array are accepted).");
    }

    return standard;
};

/**
 * Normalise la propriété <code>"level"</code>.
 *
 * @param {*}      rotten           La valeur de la proptiété
 *                                  <code>"level"</code>.
 * @param {number} auto             La valeur par défaut.
 * @param {Object} [overwriting={}] Les valeurs passées dans la ligne de
 *                                  commande pour surcharger la configuration.
 * @returns {number} La valeur normalisée.
 */
const level = function (rotten, auto, overwriting = {}) {
    const interim = "level" in overwriting ? overwriting.level
                                           : rotten;

    let standard;
    if (undefined === interim) {
        standard = auto;
    } else if ("string" === typeof interim) {
        if (interim.toUpperCase() in SEVERITY) {
            standard = SEVERITY[interim.toUpperCase()];
            if (standard > auto) {
                standard = auto;
            }
        } else {
            throw new Error("value of property 'level' is unknown (possibles" +
                            " values : 'off', 'fatal', 'error', 'warn' and" +
                            " 'info').");
        }
    } else {
        throw new Error("property 'level' is incorrect type (only string is" +
                        " accepted).");
    }

    return standard;
};

/**
 * Normalise la propriété <code>"formatter"</code>.
 *
 * @param {*}      rotten           La valeur de la proptiété
 *                                  <code>"formatter"</code>.
 * @param {string} auto             La valeur par défaut.
 * @param {string} root             L’adresse du répertoire où se trouve le
 *                                  dossier <code>.metalint/</code>.
 * @param {Object} [overwriting={}] Les valeurs passées dans la ligne de
 *                                  commande pour surcharger la configuration.
 * @returns {Object} La valeur normalisée.
 */
const formatter = function (rotten, auto, root, overwriting = {}) {
    const interim = "formatter" in overwriting ? overwriting.formatter
                                               : rotten;

    let standard;
    if (undefined === interim) {
        standard = require("./formatter/" + auto);
    } else if ("string" === typeof interim) {
        if (FORMATTERS.includes(interim.toLowerCase() + ".js")) {
            standard = require("./formatter/" + interim.toLowerCase() + ".js");
        } else if (interim.startsWith(".")) {
            standard = require(path.join(root, interim));
        } else {
            standard = require(interim);
        }
    } else {
        throw new Error("property 'formatter' is incorrect type (only string" +
                        " is accepted).");
    }
    return standard;
};

/**
 * Normalise la propriété <code>"output"</code>.
 *
 * @param {*}      rotten           La valeur de la proptiété
 *                                  <code>"output"</code>.
 * @param {Object} auto             La valeur par défaut.
 * @param {string} root             L’adresse du répertoire où se trouve le
 *                                  dossier <code>.metalint/</code>.
 * @param {Object} [overwriting={}] Les valeurs passées dans la ligne de
 *                                  commande pour surcharger la configuration.
 * @returns {Object} La valeur normalisée.
 */
const output = function (rotten, auto, root, overwriting = {}) {
    const interim = "output" in overwriting ? overwriting.output
                                            : rotten;

    let standard;
    if (undefined === interim || null === interim) {
        standard = auto;
    } else if ("string" === typeof interim) {
        let fd;
        try {
            if (interim.startsWith(".")) {
                fd = fs.openSync(path.join(root, interim), "w");
            } else {
                fd = fs.openSync(interim, "w");
            }
        } catch (_) {
            throw new Error("permission denied to open output file '" +
                            interim + "'.");
        }
        standard = fs.createWriteStream(null, { fd });
    } else {
        throw new Error("property 'output' is incorrect type (only string is" +
                        " accepted).");
    }
    return standard;
};

/**
 * Normalise la propriété <code>"options"</code>.
 *
 * @param {*}      rotten           La valeur de la proptiété
 *                                  <code>"options"</code>.
 * @param {Object} auto             La valeur par défaut.
 * @param {Object} [overwriting={}] Les valeurs passées dans la ligne de
 *                                  commande pour surcharger la configuration.
 * @returns {Object} La valeur normalisée.
 */
const options = function (rotten, auto, overwriting = {}) {
    let standard;
    // Si les options ne sont pas spécifiées ou si le formateur est surchargé :
    // utiliser les options par défaut.
    if (undefined === rotten || "formatter" in overwriting) {
        standard = auto;
    } else if ("object" === typeof rotten) {
        standard = rotten;
    } else {
        throw new Error("property 'options' is incorrect type (only object is" +
                        " accepted).");
    }
    return standard;
};

/**
 * Normalise la propriété <code>"reporters"</code>.
 *
 * @param {*}      rottens     La valeur de la proptiété
 *                             <code>"reporters"</code>.
 * @param {Object} auto        Les valeurs par défaut.
 * @param {string} root        L’adresse du répertoire où se trouve le dossier
 *                             <code>.metalint/</code>.
 * @param {Object} overwriting Les valeurs passées dans la ligne de commande
 *                             pour surcharger la configuration.
 * @returns {Object} La valeur normalisée.
 */
const reporters = function (rottens, auto, root, overwriting) {
    let standards;
    if (undefined === rottens) {
        const Formatter = formatter(undefined, "console", root, overwriting);
        standards = [
            new Formatter(level(undefined, auto.level),
                          output(undefined, process.stdout, root, overwriting),
                          options(undefined, {}, overwriting))
        ];
    } else if (Array.isArray(rottens)) {
        // Si le formateur ou le fichier de sortie sont surchargés : garder
        // seulement le premier rapporteur.
        if ("formatter" in overwriting || "output" in overwriting) {
            if (0 === rottens.length) {
                const Formatter = formatter(undefined, "console", root,
                                            overwriting);
                standards = [
                    new Formatter(level(undefined, auto.level),
                                  output(undefined, process.stdout, root,
                                         overwriting),
                                  options(undefined, {}, overwriting))
                ];
            } else {
                const Formatter = formatter(rottens[0].formatter, "console",
                                            root, overwriting);
                standards = [
                    new Formatter(level(rottens[0].level, auto.level),
                                  output(rottens[0].output, process.stdout,
                                         root, overwriting),
                                  options(rottens[0].options, {}, overwriting))
                ];
            }
        } else {
            standards = rottens.map(function (rotten) {
                const Formatter = formatter(rotten.formatter, "console", root);
                return new Formatter(level(rotten.level, auto.level),
                                     output(rotten.output, process.stdout,
                                            root),
                                     options(rotten.options, {}));
            });
        }
    } else if ("object" === typeof rottens) {
        const Formatter = formatter(rottens.formatter, "console", root,
                                    overwriting);
        standards = [
            new Formatter(level(rottens.level, auto.level),
                          output(rottens.output, process.stdout, root,
                                 overwriting),
                          options(rottens.options, {}, overwriting))
        ];
    } else {
        throw new Error("'reporters' incorrect type.");
    }
    return standards;
};

/**
 * Normalise le nom d'un enrobage (<em>wrapper</em>).
 *
 * @param {string} rotten Le nom d'un enrobage.
 * @param {string} root   L’adresse du répertoire où se trouve le dossier
 *                        <code>.metalint/</code>.
 * @returns {string} Le nom normalisé.
 */
const wrapper = function (rotten, root) {
    let standard;
    if (WRAPPERS.includes(rotten + ".js")) {
        standard = "./wrapper/" + rotten + ".js";
    } else if (rotten.startsWith(".")) {
       standard = path.join(root, rotten);
    } else {
       standard = rotten;
    }
    return standard;
};

/**
 * Normalise la propriété <code>"linters"</code>.
 *
 * @param {*}      rottens Les valeurs de la proptiété <code>"linters"</code>.
 * @param {string} root    L’adresse du répertoire où se trouve le dossier
 *                         <code>.metalint/</code>.
 * @param {string} dir     Le répertoire où se trouve le fichier de
 *                         configuration <code>metalint.json</code>.
 * @returns {Array.<Object>} La valeur normalisée.
 */
const linters = function (rottens, root, dir) {
    const standards = {};
    if (undefined === rottens) {
        throw new Error("'checkers[].linters' is undefined.");
    } else if (null === rottens) {
        throw new Error("'checkers[].linters' is null.");
    // "linters": "foolint"
    } else if ("string" === typeof rottens) {
        standards[wrapper(rottens, root)] = read(path.join(dir,
                                                           rottens + ".json"));
    // "linters": ["foolint", "barlint"]
    } else if (Array.isArray(rottens)) {
        for (const linter of rottens) {
            standards[wrapper(linter, root)] = read(path.join(
                                                        dir, linter + ".json"));
        }
    // "linters": { "foolint": ..., "barlint": ... }
    } else if ("object" === typeof rottens) {
        for (const linter in rottens) {
            // "linters": { "foolint": "qux.json" }
            if ("string" === typeof rottens[linter]) {
                standards[wrapper(linter, root)] = read(path.join(
                                                         dir, rottens[linter]));
            // "linters": { "foolint": [..., ...] }
            } else if (Array.isArray(rottens[linter])) {
                standards[wrapper(linter, root)] = {};
                for (const option of rottens[linter]) {
                    if (null === option) {
                        throw new Error("linter option is null.");
                    // "linters": { "foolint": ["qux.json", ...] }
                    } else if ("string" === typeof option) {
                        standards[wrapper(linter, root)] =
                                         merge(standards[wrapper(linter, root)],
                                               read(path.join(dir, option)));
                    // "linters": { "foolint": [{ "qux": ..., ... }, ...]
                    } else if ("object" === typeof option) {
                        standards[wrapper(linter, root)] =
                                merge(standards[wrapper(linter, root)], option);
                    } else {
                        throw new Error("linter option incorrect type.");
                    }
                }
            // "linters": { "foolint": { "qux": ..., "corge": ... } }
            // "linters": { "foolint": null }
            } else if ("object" === typeof rottens[linter]) {
                standards[wrapper(linter, root)] = rottens[linter];
            } else {
                throw new Error("linter incorrect type.");
            }
        }
    } else {
        throw new Error("'checkers[].linters' incorrect type.");
    }
    return standards;
};

/**
 * Normalise la propriété <code>"checkers"</code>.
 *
 * @param {*}                  rottens La valeur de la proptiété
 *                                     <code>"checkers"</code>.
 * @param {Object.<string, *>} auto    Les valeurs par défaut.
 * @param {string}             root    L’adresse du répertoire où se trouve le
 *                                     dossier <code>.metalint/</code>.
 * @param {string}             dir     Le répertoire où se trouve le fichier de
 *                                     configuration <code>metalint.json</code>.
 * @returns {Array.<Object>} La valeur normalisée.
 */
const checkers = function (rottens, auto, root, dir) {
    let standards;
    if (Array.isArray(rottens)) {
        if (0 === rottens.length) {
            throw new Error("'checkers' is empty.");
        } else {
            standards = rottens.map(function (rotten) {
                return {
                    "patterns": patterns(rotten.patterns, ["**"]),
                    "level":    level(rotten.level, auto.level),
                    "linters":  linters(rotten.linters, root, dir)
                };
            });
        }
    } else {
        throw new Error("'checkers' is not an array.");
    }
    return standards;
};

/**
 * Normalise la configuration. La structure de l’objet JSON contenant la
 * configuration est souple pour rendre le fichier moins verbeuse. Cette
 * fonction renseigne les valeurs par défaut pour les propriétes non-présentes.
 *
 * @param {Object} rotten      L’objet JSON contenant la configuration.
 * @param {string} root        L’adresse du répertoire où se trouve le dossier
 *                             <code>.metalint/</code>.
 * @param {string} dir         Le répertoire où se trouve le fichier de
 *                             configuration.
 * @param {Object} overwriting Les valeurs passées dans la ligne de commande
 *                             pour surcharger la configuration.
 * @returns {Object} L’objet JSON normalisé.
 */
const normalize = function (rotten, root, dir, overwriting) {
    const standard = {
        "patterns": patterns(rotten.patterns, ["**"], overwriting),
        "level":    level(rotten.level, SEVERITY.INFO, overwriting)
    };
    standard.reporters = reporters(rotten.reporters, standard, root,
                                   overwriting);
    standard.checkers = checkers(rotten.checkers, standard, root, dir);
    return standard;
};

module.exports = normalize;
