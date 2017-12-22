"use strict";

const fs       = require("fs");
const path     = require("path");
const SEVERITY = require("./severity");

/**
 * Fusionne deux objets.
 *
 * @param {*} first  Le premier objet.
 * @param {*} second Le second objet.
 * @return {*} La fusion des deux objets.
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
 * @return {Object} L’objet JSON récupéré.
 */
const read = function (file) {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
};

/**
 * Normalise la propriété <code>"patterns"</code>.
 *
 * @param {*}              rotten La valeur de la proptiété
 *                                <code>"patterns"</code>.
 * @param {Array.<string>} auto   La valeur par défaut.
 * @return {Array.<string>} La valeur normalisée.
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
 * Normalise la propriété <code>"hidden"</code>.
 *
 * @param {*}       rotten La valeur de la proptiété <code>"hidden"</code>.
 * @param {boolean} auto   La valeur par défaut.
 * @return {boolean} La valeur normalisée.
 */
const hidden = function (rotten, auto) {
    let standard;
    if (undefined === rotten) {
        standard = auto;
    } else if ("boolean" === typeof rotten) {
        standard = rotten;
    } else {
        throw new Error("property 'hidden' is incorrect type (only boolean" +
                        " is accepted.");
    }
    return standard;
};

/**
 * Normalise la propriété <code>"level"</code>.
 *
 * @param {*}      rotten La valeur de la proptiété <code>"level"</code>.
 * @param {number} auto   La valeur par défaut.
 * @return {number} La valeur normalisée.
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
            throw new Error("value of property 'level' is unkonwn (possibles" +
                            " values : 'off', 'fatal', 'error', 'warn' and" +
                            " 'info').");
        }
    } else {
        throw new Error("property 'level' is incorrect type (only string is" +
                        " accepted.");
    }
    return standard;
};

/**
 * Normalise la propriété <code>"reporter"</code>.
 *
 * @param {*}      rotten La valeur de la proptiété <code>"reporter"</code>.
 * @param {string} auto   La valeur par défaut.
 * @return {Object} La valeur normalisée.
 */
const reporter = function (rotten, auto) {
    let standard;
    if (undefined === rotten) {
        standard = require("./reporter/" + auto);
    } else if ("string" === typeof rotten) {
        if (-1 === ["checkstyle", "console", "csv",
                    "json", "none", "unix"].indexOf(rotten.toLowerCase())) {
            standard = require(path.join(process.cwd(), rotten));
        } else {
            standard = require("./reporter/" + rotten.toLowerCase());
        }
    } else {
        throw new Error("property 'reporter' is incorrect type (only string" +
                        " is accepted.");
    }
    return standard;
};

/**
 * Normalise la propriété <code>"verbose"</code>.
 *
 * @param {*}      rotten La valeur de la proptiété <code>"verbose"</code>.
 * @param {number} auto   La valeur par défaut.
 * @return {number} La valeur normalisée.
 */
const verbose = function (rotten, auto) {
    let standard;
    if (undefined === rotten) {
        standard = auto;
    } else if ("number" === typeof rotten) {
        standard = rotten;
    } else {
        throw new Error("property 'verbose' is incorrect type (only number is" +
                        " accepted.");
    }
    return standard;
};

/**
 * Normalise la propriété <code>"output"</code>.
 *
 * @param {*}      rotten La valeur de la proptiété <code>"output"</code>.
 * @param {string} auto   La valeur par défaut.
 * @return {Object} La valeur normalisée.
 */
const output = function (rotten, auto) {
    let standard;
    if (undefined === rotten || null === rotten) {
        standard = auto;
    } else if ("string" === typeof rotten) {
        try {
            standard = fs.createWriteStream(rotten, { "flags": "w" });
        } catch (exc) {
            throw new Error("property 'output' is incorrect type (only string" +
                            " is accepted.");
        }
    } else {
        throw new Error("'output' incorrect type.");
    }
    return standard;
};

/**
 * Normalise la propriété <code>"linters"</code>.
 *
 * @param {Array.<*>} rottens Les valeurs de la proptiété
 *                            <code>"linters"</code>.
 * @param {string}    dir     Le répertoire où se trouve le fichier de
 *                            configuration <code>metalint.json</code>.
 * @return {Array.<Object.<string, Object>>} La valeur normalisée.
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
                        throw new Error("linter option incorrect type");
                    }
                }
            // "linters": { "foolint": { "qux": ..., "corge": ... } }
            // "linters": { "foolint": null }
            } else if ("object" === typeof rottens[linter]) {
                standards[linter] = rottens[linter];
            } else {
                throw new Error("linter incorrect type");
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
 * @return {Array.<Object>} La valeur normalisée.
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
                    "hidden":   hidden(rotten.hidden, auto.hidden),
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
 * @param {string} dir    Le répertoire où se trouve le fichier de
 *                        configuration.
 * @return {Object} L’objet JSON normalisé.
 */
const normalize = function (rotten, dir) {
    const standard = {
        "patterns": patterns(rotten.patterns, ["**"]),
        "hidden":   hidden(rotten.hidden, false),
        "level":    level(rotten.level, SEVERITY.INFO),
        "reporter": reporter(rotten.reporter, "console"),
        "verbose":  verbose(rotten.verbose, 0),
        "output":   output(rotten.output, process.stdout)
    };
    standard.checkers = checkers(rotten.checkers, standard, dir);
    return standard;
};

module.exports = normalize;
