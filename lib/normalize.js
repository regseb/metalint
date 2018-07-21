/**
 * @module normalize
 */

"use strict";

const fs       = require("fs");
const path     = require("path");
const jsonlint = require("jsonlint");
const SEVERITY = require("./severity");

/**
 * Fusionne deux objets.
 *
 * @param {*} first  Le premier objet.
 * @param {*} second Le second objet.
 * @returns {*} La fusion des deux objets.
 */
const merge = function (first, second) {
    if ("object" !== typeof first || "object" !== typeof second) {
        return second;
    }
    const third = {};
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
 * @param {*}              rotten La valeur de la proptiété
 *                                <code>"patterns"</code>.
 * @param {Array.<string>} auto   La valeur par défaut.
 * @returns {Array.<string>} La valeur normalisée.
 */
const patterns = function (rotten, auto) {
    let standard;
    if (undefined === rotten) {
        standard = auto;
    } else if ("string" === typeof rotten) {
        standard = [rotten];
    } else if (Array.isArray(rotten)) {
        standard = rotten;
    } else {
        throw new Error("property 'patterns' is incorrect type (string and" +
                        " array are accepted).");
    }
    return standard;
};

/**
 * Normalise la propriété <code>"level"</code>.
 *
 * @param {*}      rotten La valeur de la proptiété <code>"level"</code>.
 * @param {number} auto   La valeur par défaut.
 * @returns {number} La valeur normalisée.
 */
const level = function (rotten, auto) {
    let standard;
    if (undefined === rotten) {
        standard = auto;
    } else if ("string" === typeof rotten) {
        if (rotten.toUpperCase() in SEVERITY) {
            standard = SEVERITY[rotten.toUpperCase()];
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
 * @param {*}      rotten La valeur de la proptiété <code>"formatter"</code>.
 * @param {string} auto   La valeur par défaut.
 * @param {string} root   L’adresse du répertoire où se trouve le dossier
 *                        <code>.metalint/</code>.
 * @returns {Object} La valeur normalisée.
 */
const formatter = function (rotten, auto, root) {
    let standard;
    if (undefined === rotten) {
        standard = require("./formatter/" + auto);
    } else if ("string" === typeof rotten) {
        if (-1 === ["checkstyle", "console", "csv",
                    "json", "none", "unix"].indexOf(rotten.toLowerCase())) {
            const file = rotten.startsWith("/") ? rotten
                                                : path.join(root, rotten);
            standard = require(file);
        } else {
            standard = require("./formatter/" + rotten.toLowerCase());
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
 * @param {*}      rotten La valeur de la proptiété <code>"output"</code>.
 * @param {Object} auto   La valeur par défaut.
 * @param {string} root   L’adresse du répertoire où se trouve le dossier
 *                        <code>.metalint/</code>.
 * @returns {Object} La valeur normalisée.
 */
const output = function (rotten, auto, root) {
    let standard;
    if (undefined === rotten || null === rotten) {
        standard = auto;
    } else if ("string" === typeof rotten) {
        const file = rotten.startsWith("/") ? rotten
                                            : path.join(root, rotten);
        try {
            standard = fs.createWriteStream(file, { "flags": "w" });
        } catch (_) {
            throw new Error("property 'output' is incorrect type (only string" +
                            " is accepted).");
        }
    } else {
        throw new Error("'output' incorrect type.");
    }
    return standard;
};

/**
 * Normalise la propriété <code>"options"</code>.
 *
 * @param {*}      rotten La valeur de la proptiété <code>"options"</code>.
 * @param {Object} auto   La valeur par défaut.
 * @returns {Object} La valeur normalisée.
 */
const options = function (rotten, auto) {
    let standard;
    if (undefined === rotten) {
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
 * @param {*}      rottens La valeur de la proptiété <code>"reporters"</code>.
 * @param {Object} auto    Les valeurs par défaut.
 * @param {string} root    L’adresse du répertoire où se trouve le dossier
 *                         <code>.metalint/</code>.
 * @returns {Object} La valeur normalisée.
 */
const reporters = function (rottens, auto, root) {
    let standards;
    if (undefined === rottens) {
        const Formatter = formatter(undefined, "console", root);
        standards = [
            new Formatter(level(undefined, auto.level),
                          output(undefined, process.stdout, root),
                          options(undefined, {}))
        ];
    } else if (Array.isArray(rottens)) {
        standards = rottens.map(function (rotten) {
            const Formatter = formatter(rotten.formatter, "console", root);
            return new Formatter(level(rotten.level, auto.level),
                                 output(rotten.output, process.stdout, root),
                                 options(rotten.options, {}));
        });
    } else if ("object" === typeof rottens) {
        const Formatter = formatter(rottens.formatter, "console", root);
        standards = [
            new Formatter(level(rottens.level, auto.level),
                          output(rottens.output, process.stdout, root),
                          options(rottens.options, {}))
        ];
    } else {
        throw new Error("'reporters' incorrect type.");
    }
    return standards;
};

/**
 * Normalise la propriété <code>"linters"</code>.
 *
 * @param {Array.<*>} rottens Les valeurs de la proptiété
 *                            <code>"linters"</code>.
 * @param {string}    dir     Le répertoire où se trouve le fichier de
 *                            configuration <code>metalint.json</code>.
 * @returns {Array.<Object.<string, Object>>} La valeur normalisée.
 */
const linters = function (rottens, dir) {
    const standards = {};
    if (undefined === rottens) {
        throw new Error("'checkers[].linters' is undefined.");
    } else if (null === rottens) {
        throw new Error("'checkers[].linters' is null.");
    // "linters": "foolint"
    } else if ("string" === typeof rottens) {
        standards[rottens] = read(path.join(dir, rottens + ".json"));
    // "linters": ["foolint", "barlint"]
    } else if (Array.isArray(rottens)) {
        for (const linter of rottens) {
            standards[linter] = read(path.join(dir, linter + ".json"));
        }
    // "linters": { "foolint": ..., "barlint": ... }
    } else if ("object" === typeof rottens) {
        for (const linter in rottens) {
            // "linters": { "foolint": "qux.json" }
            if ("string" === typeof rottens[linter]) {
                standards[linter] = read(path.join(dir, rottens[linter]));
            // "linters": { "foolint": [..., ...] }
            } else if (Array.isArray(rottens[linter])) {
                standards[linter] = {};
                for (const option of rottens[linter]) {
                    if (null === option) {
                        throw new Error("linter option is null.");
                    // "linters": { "foolint": ["qux.json", ...] }
                    } else if ("string" === typeof option) {
                        standards[linter] = merge(standards[linter],
                                                  read(path.join(dir, option)));
                    // "linters": { "foolint": [{ "qux": ..., ... }, ...]
                    } else if ("object" === typeof option) {
                        standards[linter] = merge(standards[linter], option);
                    } else {
                        throw new Error("linter option incorrect type.");
                    }
                }
            // "linters": { "foolint": { "qux": ..., "corge": ... } }
            // "linters": { "foolint": null }
            } else if ("object" === typeof rottens[linter]) {
                standards[linter] = rottens[linter];
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
 * @param {string}             dir     Le répertoire où se trouve le fichier de
 *                                     configuration <code>metalint.json</code>.
 * @returns {Array.<Object>} La valeur normalisée.
 */
const checkers = function (rottens, auto, dir) {
    let standards;
    if (Array.isArray(rottens)) {
        if (0 === rottens.length) {
            throw new Error("'checkers' is empty.");
        } else {
            standards = rottens.map(function (rotten) {
                return {
                    "patterns": patterns(rotten.patterns, ["**"]),
                    "level":    level(rotten.level, auto.level),
                    "linters":  linters(rotten.linters, dir)
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
 * @param {Object} rotten L’objet JSON contenant la configuration.
 * @param {string} root   L’adresse du répertoire où se trouve le dossier
 *                        <code>.metalint/</code>.
 * @param {string} dir    Le répertoire où se trouve le fichier de
 *                        configuration.
 * @returns {Object} L’objet JSON normalisé.
 */
const normalize = function (rotten, root, dir) {
    const standard = {
        "patterns": patterns(rotten.patterns, ["**"]),
        "level":    level(rotten.level, SEVERITY.INFO)
    };
    standard.reporters = reporters(rotten.reporters, standard, root);
    standard.checkers = checkers(rotten.checkers, standard, dir);
    return standard;
};

module.exports = normalize;
