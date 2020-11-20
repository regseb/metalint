/**
 * @module
 */

import { createWriteStream, promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { SEVERITY } from "./severity.js";

/**
 * @typedef {NodeJS.WritableStream} WritableStream
 * @typedef {import("./types").Formatter} Formatter
 * @typedef {import("./types").Config} Config
 */

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

/**
 * La liste des formaters.
 *
 * @constant {Promise<string[]>} FORMATTERS
 */
const FORMATTERS = fs.readdir(path.join(DIRNAME, "formatter"));

/**
 * La liste des enrobages.
 *
 * @constant {Promise<string[]>} WRAPPERS
 */
const WRAPPERS = fs.readdir(path.join(DIRNAME, "wrapper"));

/**
 * Fusionne deux objets.
 *
 * @param {*} first  Le premier objet.
 * @param {*} second Le second objet.
 * @returns {*} La fusion des deux objets.
 */
const merge = function (first, second) {
    /** @type {*} */
    let third;

    if ("object" === typeof first && !Array.isArray(first) &&
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
 * @param {string} file L'adresse du fichier qui sera lu.
 * @returns {Promise<Object>} L'objet JSON récupéré.
 */
const read = async function (file) {
    try {
        return (await import(file)).default;
    } catch (err) {
        throw new Error(file + ": " + err.message);
    }
};

/**
 * Normalise la propriété <code>"patterns"</code>.
 *
 * @param {*}        rotten           La valeur de la propriété
 *                                    <code>"patterns"</code>.
 * @param {string[]} auto             La valeur par défaut.
 * @param {Object}   [overwriting={}] Les valeurs passées dans la ligne de
 *                                    commande pour surcharger la configuration.
 * @returns {string[]} La valeur normalisée.
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
        throw new TypeError("property 'patterns' is incorrect type (string" +
                            " and array are accepted).");
    }

    return standard;
};

/**
 * Normalise la propriété <code>"level"</code>.
 *
 * @param {*}      rotten           La valeur de la propriété
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
        throw new TypeError("property 'level' is incorrect type (only string" +
                            " is accepted).");
    }

    return standard;
};

/**
 * Normalise la propriété <code>"formatter"</code>.
 *
 * @param {*}      rotten           La valeur de la propriété
 *                                  <code>"formatter"</code>.
 * @param {string} auto             La valeur par défaut.
 * @param {string} root             L'adresse du répertoire où se trouve le
 *                                  dossier <code>.metalint/</code>.
 * @param {Object} [overwriting={}] Les valeurs passées dans la ligne de
 *                                  commande pour surcharger la configuration.
 * @returns {Promise<Class>} La valeur normalisée.
 */
const formatter = async function (rotten, auto, root, overwriting = {}) {
    const interim = "formatter" in overwriting ? overwriting.formatter
                                               : rotten;

    let standard;
    if (undefined === interim) {
        standard = await import("./formatter/" + auto + ".js");
    } else if ("string" === typeof interim) {
        if ((await FORMATTERS).includes(interim.toLowerCase() + ".js")) {
            standard = await import("./formatter/" + interim.toLowerCase() +
                                    ".js");
        } else if (interim.startsWith(".")) {
            standard = await import(path.join(root, interim));
        } else {
            standard = await import(interim);
        }
    } else {
        throw new TypeError("property 'formatter' is incorrect type (only" +
                            " string is accepted).");
    }
    return standard.Formatter;
};

/**
 * Normalise la propriété <code>"output"</code>.
 *
 * @param {*}              rotten           La valeur de la propriété
 *                                          <code>"output"</code>.
 * @param {WritableStream} auto             La valeur par défaut.
 * @param {string}         root             L'adresse du répertoire où se trouve
 *                                          le dossier <code>.metalint/</code>.
 * @param {Object}         [overwriting={}] Les valeurs passées dans la ligne de
 *                                          commande pour surcharger la
 *                                          configuration.
 * @returns {Promise<WritableStream>} La valeur normalisée.
 */
const output = async function (rotten, auto, root, overwriting = {}) {
    const interim = "output" in overwriting ? overwriting.output
                                            : rotten;

    let standard;
    if (undefined === interim || null === interim) {
        standard = auto;
    } else if ("string" === typeof interim) {
        let fileHandle;
        try {
            fileHandle = interim.startsWith(".")
                                  ? await fs.open(path.join(root, interim), "w")
                                  : await fs.open(interim, "w");
        } catch {
            throw new Error("permission denied to open output file '" +
                            interim + "'.");
        }
        standard = createWriteStream(null, { fd: fileHandle.fd });
    } else {
        throw new TypeError("property 'output' is incorrect type (only string" +
                            " is accepted).");
    }
    return standard;
};

/**
 * Normalise la propriété <code>"options"</code>.
 *
 * @param {*}      rotten           La valeur de la propriété
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
        throw new TypeError("property 'options' is incorrect type (only" +
                            " object is accepted).");
    }
    return standard;
};

/**
 * Normalise la propriété <code>"reporters"</code>.
 *
 * @param {*}      rottens     La valeur de la propriété
 *                             <code>"reporters"</code>.
 * @param {Object} auto        Les valeurs par défaut.
 * @param {string} root        L'adresse du répertoire où se trouve le dossier
 *                             <code>.metalint/</code>.
 * @param {Object} overwriting Les valeurs passées dans la ligne de commande
 *                             pour surcharger la configuration.
 * @returns {Promise<Formatter[]>} La valeur normalisée.
 */
const reporters = async function (rottens, auto, root, overwriting) {
    let standards;
    if (undefined === rottens) {
        const Formatter = await formatter(undefined,
                                          "console",
                                          root,
                                          overwriting);
        standards = [new Formatter(
            level(undefined, auto.level),
            await output(undefined, process.stdout, root, overwriting),
            options(undefined, {}, overwriting),
        )];
    } else if (Array.isArray(rottens)) {
        // Si le formateur ou le fichier de sortie sont surchargés : garder
        // seulement le premier rapporteur.
        if ("formatter" in overwriting || "output" in overwriting) {
            if (0 === rottens.length) {
                const Formatter = await formatter(undefined,
                                                  "console",
                                                  root,
                                                  overwriting);
                standards = [new Formatter(
                    level(undefined, auto.level),
                    await output(undefined, process.stdout, root, overwriting),
                    options(undefined, {}, overwriting),
                )];
            } else {
                const Formatter = await formatter(rottens[0].formatter,
                                                  "console",
                                                  root,
                                                  overwriting);
                standards = [new Formatter(
                    level(rottens[0].level, auto.level),
                    await output(rottens[0].output,
                                 process.stdout,
                                 root,
                                 overwriting),
                    options(rottens[0].options, {}, overwriting),
                )];
            }
        } else {
            standards = await Promise.all(rottens.map(async (rotten) => {
                const Formatter = await formatter(rotten.formatter,
                                                  "console",
                                                  root);
                return new Formatter(
                    level(rotten.level, auto.level),
                    await output(rotten.output, process.stdout, root),
                    options(rotten.options, {}),
                );
            }));
        }
    } else if ("object" === typeof rottens) {
        const Formatter = await formatter(rottens.formatter,
                                          "console",
                                          root,
                                          overwriting);
        standards = [new Formatter(
            level(rottens.level, auto.level),
            await output(rottens.output, process.stdout, root, overwriting),
            options(rottens.options, {}, overwriting),
        )];
    } else {
        throw new TypeError("'reporters' incorrect type.");
    }
    return standards;
};

/**
 * Normalise le nom d'un enrobage (<em>wrapper</em>).
 *
 * @param {string} rotten Le nom d'un enrobage.
 * @param {string} root   L'adresse du répertoire où se trouve le dossier
 *                        <code>.metalint/</code>.
 * @returns {string} Le nom normalisé.
 */
const wrapper = async function (rotten, root) {
    let standard;
    if ((await WRAPPERS).includes(rotten + ".js")) {
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
 * @param {*}      rottens Les valeurs de la propriété <code>"linters"</code>.
 * @param {string} root    L'adresse du répertoire où se trouve le dossier
 *                         <code>.metalint/</code>.
 * @param {string} dir     Le répertoire où se trouve le fichier de
 *                         configuration <code>metalint.config.js</code>.
 * @returns {Promise<Object>} La valeur normalisée.
 */
const linters = async function (rottens, root, dir) {
    const standards = {};
    if (undefined === rottens) {
        throw new Error("'checkers[].linters' is undefined.");
    } else if (null === rottens) {
        throw new Error("'checkers[].linters' is null.");
    // "linters": "foolint"
    } else if ("string" === typeof rottens) {
        standards[await wrapper(rottens, root)] =
                             await read(path.join(dir, rottens + ".config.js"));
    // "linters": ["foolint", "barlint"]
    } else if (Array.isArray(rottens)) {
        for (const linter of rottens) {
            standards[await wrapper(linter, root)] =
                              await read(path.join(dir, linter + ".config.js"));
        }
    // "linters": { "foolint": ..., "barlint": ... }
    } else if ("object" === typeof rottens) {
        for (const [linter, params] of Object.entries(rottens)) {
            // "linters": { "foolint": "qux.config.js" }
            if ("string" === typeof params) {
                standards[await wrapper(linter, root)] =
                                             await read(path.join(dir, params));
            // "linters": { "foolint": [..., ...] }
            } else if (Array.isArray(params)) {
                standards[await wrapper(linter, root)] = {};
                for (const param of params) {
                    if (null === param) {
                        throw new Error("linter option is null.");
                    // "linters": { "foolint": ["qux.config.js", ...] }
                    } else if ("string" === typeof param) {
                        standards[await wrapper(linter, root)] =
                                   merge(standards[await wrapper(linter, root)],
                                         await read(path.join(dir, param)));
                    // "linters": { "foolint": [{ "qux": ..., ... }, ...]
                    } else if ("object" === typeof param) {
                        standards[await wrapper(linter, root)] =
                                   merge(standards[await wrapper(linter, root)],
                                         param);
                    } else {
                        throw new TypeError("linter option incorrect type.");
                    }
                }
            // "linters": { "foolint": { "qux": ..., "corge": ... } }
            // "linters": { "foolint": null }
            } else if ("object" === typeof params) {
                standards[await wrapper(linter, root)] = params;
            } else {
                throw new TypeError("linter incorrect type.");
            }
        }
    } else {
        throw new TypeError("'checkers[].linters' incorrect type.");
    }
    return standards;
};

/**
 * Normalise la propriété <code>"checkers"</code>.
 *
 * @param {*}      rottens La valeur de la propriété <code>"checkers"</code>.
 * @param {Object} auto    Les valeurs par défaut.
 * @param {string} root    L'adresse du répertoire où se trouve le dossier
 *                         <code>.metalint/</code>.
 * @param {string} dir     Le répertoire où se trouve le fichier de
 *                         configuration <code>metalint.config.js</code>.
 * @returns {Promise<Object[]>} La valeur normalisée.
 */
const checkers = async function (rottens, auto, root, dir) {
    let standards;
    if (Array.isArray(rottens)) {
        if (0 === rottens.length) {
            throw new Error("'checkers' is empty.");
        } else {
            standards = await Promise.all(rottens.map(async (rotten) => ({
                patterns: patterns(rotten.patterns, ["**"]),
                level:    level(rotten.level, auto.level),
                linters:  await linters(rotten.linters, root, dir),
            })));
        }
    } else {
        throw new TypeError("'checkers' is not an array.");
    }
    return standards;
};

/**
 * Normalise la configuration. La structure de l'objet JSON contenant la
 * configuration est souple pour rendre le fichier moins verbeuse. Cette
 * fonction renseigne les valeurs par défaut pour les propriétes non-présentes.
 *
 * @param {Object} rotten      L'objet JSON contenant la configuration.
 * @param {string} root        L'adresse du répertoire où se trouve le dossier
 *                             <code>.metalint/</code>.
 * @param {string} dir         Le répertoire où se trouve le fichier de
 *                             configuration.
 * @param {Object} overwriting Les valeurs passées dans la ligne de commande
 *                             pour surcharger la configuration.
 * @returns {Promise<Config>} L'objet JSON normalisé.
 */
export const normalize = async function (rotten, root, dir, overwriting) {
    /** @type {Config} */
    const standard = {
        patterns: patterns(rotten.patterns, ["**"], overwriting),
        level:    level(rotten.level, SEVERITY.INFO, overwriting),
    };
    standard.reporters = await reporters(rotten.reporters,
                                         standard,
                                         root,
                                         overwriting);
    standard.checkers = await checkers(rotten.checkers, standard, root, dir);
    return standard;
};
