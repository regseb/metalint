/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import path from "node:path";
import { pathToFileURL } from "node:url";
import Formatter, { FORMATTERS } from "../formatter/formatter.js";
import Levels from "../levels.js";
import Wrapper, { WRAPPERS } from "../wrapper/wrapper.js";

/**
 * @import { TypeofFormatter } from "../formatter/formatter.js"
 * @import { Level } from "../levels.js"
 * @import { TypeofWrapper } from "../wrapper/wrapper.js"
 */

/**
 * @typedef {Object} NormalizedConfigReporter Le type d'une configuration
 *                                            normalisée d'un rapporteur.
 * @prop {TypeofFormatter}           formatter La classe du formateur.
 * @prop {Level}                     [level]   Le niveau de sévérité minimum des
 *                                             notifications affichées.
 * @prop {Record<string, unknown>[]} options   Les options du formateur.
 */

/**
 * @typedef {Object} NormalizedConfigLinter Le type d'une configuration
 *                                          normalisée d'un linter.
 * @prop {TypeofWrapper}             wrapper La classe de l'enrobage.
 * @prop {boolean}                   [fix]   La marque indiquant s'il faut
 *                                           corriger les fichiers.
 * @prop {Level}                     [level] Le niveau de sévérité minimum des
 *                                           notifications retournées.
 * @prop {Record<string, unknown>[]} options Les options du linter.
 */

/**
 * @typedef {Object} NormalizedConfigOverride Le type d'une configuration
 *                                            normalisée d'une surcharge.
 * @prop {string[]}                 patterns Les motifs des fichiers à analyser.
 * @prop {boolean}                  [fix]    La marque indiquant s'il faut
 *                                           corriger les fichiers.
 * @prop {Level}                    [level]  Le niveau de sévérité minimum des
 *                                           notifications retournées.
 * @prop {NormalizedConfigLinter[]} linters  Les configurations des linters.
 */

/**
 * @typedef {Object} NormalizedConfigChecker Le type d'une configuration
 *                                           normalisée d'un checker.
 * @prop {string[]}                   patterns  Les motifs des fichiers à
 *                                              analyser.
 * @prop {boolean}                    [fix]     La marque indiquant s'il faut
 *                                              corriger les fichiers.
 * @prop {Level}                      [level]   Le niveau de sévérité minimum
 *                                              des notifications retournées.
 * @prop {NormalizedConfigLinter[]}   linters   Les configurations des linters.
 * @prop {NormalizedConfigOverride[]} overrides Les configurations des
 *                                              surcharges.
 */

/**
 * @typedef {Object} NormalizedConfig Le type d'une configuration normalisée.
 * @prop {string[]}                   patterns  Les motifs des fichiers à
 *                                              analyser.
 * @prop {boolean}                    [fix]     La marque indiquant s'il faut
 *                                              corriger les fichiers.
 * @prop {Level}                      [level]   Le niveau de sévérité minimum
 *                                              des notifications.
 * @prop {NormalizedConfigReporter[]} reporters Les configurations des
 *                                              rapporteurs.
 * @prop {NormalizedConfigChecker[]}  checkers  Les configurations des checkers.
 */

/**
 * Lit un fichier JavaScript exportant un objet JSON.
 *
 * @param {string} file L'adresse du fichier qui sera lu.
 * @returns {Promise<Record<string, unknown>>} L'objet JSON récupéré.
 */
const read = async (file) => {
    try {
        // eslint-disable-next-line noUnsanitized/method
        const module = await import(pathToFileURL(file).href);
        return module.default;
    } catch (err) {
        throw new Error(`Cannot import '${file}'.`, { cause: err });
    }
};

/**
 * Normalise une propriété `"patterns"`.
 *
 * @param {any} partials La valeur d'une des propriétés `"patterns"`.
 * @returns {string[]} La valeur normalisée.
 * @throws {Error} Si le `"patterns"` n'est pas renseigné.
 * @throws {TypeError} Si le `"patterns"` n'a pas le bon type.
 */
export const normalizePatterns = (partials) => {
    let normalized;
    if (undefined === partials) {
        throw new Error("Property 'patterns' is required.");
    } else if ("string" === typeof partials) {
        normalized = [partials];
    } else if (Array.isArray(partials)) {
        for (const partial of partials) {
            if ("string" !== typeof partial) {
                throw new TypeError(
                    "Property 'patterns' is incorrect type (string and array" +
                        " of strings are accepted).",
                );
            }
        }
        normalized = partials;
    } else {
        throw new TypeError(
            "Property 'patterns' is incorrect type (string and array of" +
                " strings are accepted).",
        );
    }

    return normalized;
};

/**
 * Normalise une propriété `"fix"`.
 *
 * @param {any} partial La valeur d'une propriété `"fix"`.
 * @returns {boolean|undefined} La valeur normalisée.
 * @throws {TypeError} Si le `"fix"` n'a pas le bon type.
 */
export const normalizeFix = (partial) => {
    let normalized;
    if (undefined === partial) {
        normalized = undefined;
    } else if ("boolean" === typeof partial) {
        normalized = partial;
    } else {
        throw new TypeError(
            "Property 'fix' is incorrect type (only boolean is accepted).",
        );
    }

    return normalized;
};

/**
 * Normalise une propriété `"level"`.
 *
 * @param {any} partial La valeur d'une propriété `"level"`.
 * @returns {Level|undefined} La valeur normalisée.
 * @throws {Error}     Si le `"level"` est invalide.
 * @throws {TypeError} Si le `"level"` n'a pas le bon type.
 */
export const normalizeLevel = (partial) => {
    let normalized;
    if (undefined === partial) {
        normalized = undefined;
    } else if ("string" === typeof partial) {
        if (partial.toUpperCase() in Levels) {
            normalized = Levels[partial.toUpperCase()];
        } else {
            throw new Error(
                "Value of property 'level' is unknown (possibles values:" +
                    " 'off', 'fatal', 'error', 'warn' and 'info').",
            );
        }
    } else if ("number" === typeof partial) {
        if (Object.values(Levels).includes(partial)) {
            normalized = /** @type {Level} */ (partial);
        } else {
            throw new Error(
                "Value of property 'level' is unknown (possibles values:" +
                    " Levels.OFF, Levels.FATAL, Levels.ERROR, Levels.WARN and" +
                    " Levels.INFO).",
            );
        }
    } else {
        throw new TypeError(
            "Property 'level' is incorrect type (only string and number is" +
                " accepted).",
        );
    }

    return normalized;
};

/**
 * Normalise une propriété `"formatter"`.
 *
 * @param {any} partial La valeur d'une propriété `"formatter"`.
 * @returns {Promise<TypeofFormatter>} La valeur normalisée.
 * @throws {Error}     Si le `"formatter"` est invalide.
 * @throws {TypeError} Si le `"formatter"` n'a pas le bon type.
 */
export const normalizeFormatter = async (partial) => {
    let normalized;
    if (undefined === partial) {
        const imported = await import("../formatter/console.js");
        normalized = imported.default;
    } else if ("string" === typeof partial) {
        if (FORMATTERS.includes(partial.toLowerCase())) {
            // eslint-disable-next-line noUnsanitized/method
            const imported = await import(
                `../formatter/${partial.toLowerCase()}.js`
            );
            normalized = imported.default;
        } else {
            throw new Error(
                "Value of property 'formatter' is unknown (possibles values:" +
                    ` "${FORMATTERS.join('", "')}").`,
            );
        }
        // eslint-disable-next-line no-prototype-builtins
    } else if (Formatter.isPrototypeOf(partial)) {
        normalized = partial;
    } else {
        throw new TypeError(
            "Property 'formatter' is incorrect type (only string is accepted).",
        );
    }
    return normalized;
};

/**
 * Normalise une propriété `options"`.
 *
 * @param {any}    partial     La valeur d'une propriété `"options"`.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             `metalint.config.js`.
 * @returns {Promise<Record<string, unknown>>} La valeur normalisée.
 * @throws {TypeError} Si l'`"options"` n'a pas le bon type.
 */
export const normalizeOption = async (partial, { dir }) => {
    let normalized;
    if ("string" === typeof partial) {
        normalized = await read(path.join(dir, partial));
    } else if ("object" === typeof partial) {
        normalized = partial;
    } else {
        throw new TypeError(
            "One of 'options' is incorrect type (only object is accepted).",
        );
    }
    return normalized;
};

/**
 * Normalise une propriété `"options"`.
 *
 * @param {any}    partials    La valeur d'une propriété `"options"`.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             `metalint.config.js`.
 * @returns {Promise<Record<string, unknown>[]>} La valeur normalisée.
 * @throws {TypeError} Si l'`"options"` n'a pas le bon type.
 */
export const normalizeOptions = async (partials, { dir }) => {
    let normalizeds;
    if (undefined === partials) {
        normalizeds = [await normalizeOption({}, { dir })];
    } else if (Array.isArray(partials)) {
        normalizeds = await Promise.all(
            partials.map((p) => normalizeOption(p, { dir })),
        );
    } else if ("string" === typeof partials || "object" === typeof partials) {
        normalizeds = [await normalizeOption(partials, { dir })];
    } else {
        throw new TypeError("'options' incorrect type.");
    }
    return normalizeds;
};

/**
 * Normalise la propriété `"reporters"`.
 *
 * @param {any}    partial     La valeur de la propriété `"reporter"`.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             `metalint.config.js`.
 * @returns {Promise<NormalizedConfigReporter>} La valeur normalisée.
 * @throws {TypeError} Si le `"reporters"` n'a pas le bon type.
 */
export const normalizeReporter = async (partial, { dir }) => {
    let normalized;
    if ("object" === typeof partial) {
        normalized = {
            formatter: await normalizeFormatter(partial.formatter),
            level: normalizeLevel(partial.level),
            options: await normalizeOptions(partial.options, { dir }),
        };
    } else {
        throw new TypeError("One of 'reporters' incorrect type.");
    }
    return normalized;
};

/**
 * Normalise la propriété `"reporters"`.
 *
 * @param {any}    partials    La valeur de la propriété `"reporter"`.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             `metalint.config.js`.
 * @returns {Promise<NormalizedConfigReporter[]>} La valeur normalisée.
 * @throws {TypeError} Si le `"reporters"` n'a pas le bon type.
 */
export const normalizeReporters = async (partials, { dir }) => {
    let normalizeds;
    if (undefined === partials) {
        normalizeds = [await normalizeReporter({}, { dir })];
    } else if (Array.isArray(partials)) {
        normalizeds = await Promise.all(
            partials.map((partial) => {
                return normalizeReporter(partial, { dir });
            }),
        );
    } else if ("object" === typeof partials) {
        normalizeds = [await normalizeReporter(partials, { dir })];
    } else {
        throw new TypeError("'reporters' incorrect type.");
    }
    return normalizeds;
};

/**
 * Normalise une propriété `"wrapper"`.
 *
 * @param {any} partial La valeur d'une propriété `"wrapper"`.
 * @returns {Promise<TypeofWrapper>} La valeur normalisée.
 * @throws {TypeError} Si le `"reporters"` n'a pas le bon type.
 */
export const normalizeWrapper = async (partial) => {
    let normalized;
    if ("string" === typeof partial) {
        if (WRAPPERS.includes(partial.toLowerCase())) {
            // eslint-disable-next-line noUnsanitized/method
            const imported = await import(
                `../wrapper/${partial.toLowerCase()}.js`
            );
            normalized = imported.default;
        } else {
            throw new Error(
                "Value of property 'wrapper' is unknown (possibles values:" +
                    ` "${WRAPPERS.join('", "')}").`,
            );
        }
        // eslint-disable-next-line no-prototype-builtins
    } else if (Wrapper.isPrototypeOf(partial)) {
        normalized = partial;
    } else {
        throw new TypeError(
            "Property 'wrapper' is incorrect type (only string is accepted).",
        );
    }
    return normalized;
};

/**
 * Normalise une propriété `"linters"`.
 *
 * @param {any}    partial     La valeur d'une propriété `"linters"`.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             `metalint.config.js`.
 * @returns {Promise<NormalizedConfigLinter>} La valeur normalisée.
 * @throws {TypeError} Si le `"linters"` n'a pas le bon type.
 */
export const normalizeLinter = async (partial, { dir }) => {
    let normalized;
    if ("string" === typeof partial) {
        // Chercher un "_" entouré de lettres ou de chiffres pour éviter les
        // faux positifs des linters avec un double "__".
        const name = /[0-9a-z]_[0-9a-z]/v.test(partial)
            ? partial.slice(0, partial.search(/[0-9a-z]_[0-9a-z]/v) + 1)
            : partial;
        const wrapper = await normalizeWrapper(name);
        if (wrapper.configurable) {
            normalized = {
                wrapper,
                fix: normalizeFix(undefined),
                level: normalizeLevel(undefined),
                options: await normalizeOptions(`${partial}.config.js`, {
                    dir,
                }),
            };
        } else if (name === partial) {
            normalized = {
                wrapper,
                fix: normalizeFix(undefined),
                level: normalizeLevel(undefined),
                options: await normalizeOptions(undefined, { dir }),
            };
        } else {
            throw new Error(`'${partial}' isn't configurable.`);
        }
    } else if ("object" === typeof partial) {
        normalized = {
            wrapper: await normalizeWrapper(partial.wrapper),
            fix: normalizeFix(partial.fix),
            level: normalizeLevel(partial.level),
            options: await normalizeOptions(partial.options, { dir }),
        };
    } else {
        throw new TypeError("One of 'linters' incorrect type.");
    }
    return normalized;
};

/**
 * Normalise une propriété `"linters"`.
 *
 * @param {any}    partials    La valeur d'une propriété `"linters"`.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             `metalint.config.js`.
 * @returns {Promise<NormalizedConfigLinter[]>} La valeur normalisée.
 * @throws {TypeError} Si le `"linters"` n'a pas le bon type.
 */
export const normalizeLinters = async (partials, { dir }) => {
    let normalizeds;
    if (undefined === partials) {
        normalizeds = /** @type {NormalizedConfigLinter[]} */ ([]);
    } else if (Array.isArray(partials)) {
        normalizeds = await Promise.all(
            partials.map((p) => normalizeLinter(p, { dir })),
        );
    } else if ("string" === typeof partials || "object" === typeof partials) {
        normalizeds = [await normalizeLinter(partials, { dir })];
    } else {
        throw new TypeError("'linters' incorrect type.");
    }
    return normalizeds;
};

/**
 * Normalise une propriété `"overrides"`.
 *
 * @param {any}    partial     La valeur d'une propriété `"overrides"`.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             `metalint.config.js`.
 * @returns {Promise<NormalizedConfigOverride>} La valeur normalisée.
 * @throws {TypeError} Si le `"overrides"` n'a pas le bon type.
 */
export const normalizeOverride = async (partial, { dir }) => {
    let normalized;
    if ("object" === typeof partial) {
        normalized = {
            patterns: normalizePatterns(partial.patterns),
            fix: normalizeFix(partial.fix),
            level: normalizeLevel(partial.level),
            linters: await normalizeLinters(partial.linters, { dir }),
        };
    } else {
        throw new TypeError("One of 'overrides' incorrect type.");
    }
    return normalized;
};

/**
 * Normalise une propriété `"overrides"`.
 *
 * @param {any}    partials    La valeur d'une propriété `"overrides"`.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             `metalint.config.js`.
 * @returns {Promise<NormalizedConfigOverride[]>} La valeur normalisée.
 * @throws {TypeError} Si le `"overrides"` n'a pas le bon type.
 */
export const normalizeOverrides = async (partials, { dir }) => {
    let normalizeds;
    if (undefined === partials) {
        normalizeds = /** @type {NormalizedConfigOverride[]} */ ([]);
    } else if (Array.isArray(partials)) {
        normalizeds = await Promise.all(
            partials.map((p) => normalizeOverride(p, { dir })),
        );
    } else if ("object" === typeof partials) {
        normalizeds = [await normalizeOverride(partials, { dir })];
    } else {
        throw new TypeError("'overrides' is incorrect type.");
    }
    return normalizeds;
};

/**
 * Normalise la propriété `"checkers"`.
 *
 * @param {any}    partial     La valeur de la propriété `"checkers"`.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             `metalint.config.js`.
 * @returns {Promise<NormalizedConfigChecker>} La valeur normalisée.
 * @throws {TypeError} Si le `"checkers"` n'a pas le bon type.
 */
export const normalizeChecker = async (partial, { dir }) => {
    let normalized;
    if ("object" === typeof partial) {
        normalized = {
            patterns: normalizePatterns(partial.patterns),
            fix: normalizeFix(partial.fix),
            level: normalizeLevel(partial.level),
            linters: await normalizeLinters(partial.linters, { dir }),
            overrides: await normalizeOverrides(partial.overrides, { dir }),
        };
    } else {
        throw new TypeError("One of 'checkers' incorrect type.");
    }
    return normalized;
};

/**
 * Normalise la propriété `"checkers"`.
 *
 * @param {any}    partials    La valeur de la propriété `"checkers"`.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             `metalint.config.js`.
 * @returns {Promise<NormalizedConfigChecker[]>} La valeur normalisée.
 * @throws {TypeError} Si le `"checkers"` n'a pas le bon type.
 */
export const normalizeCheckers = async (partials, { dir }) => {
    let normalizeds;
    if (undefined === partials) {
        normalizeds = /** @type {NormalizedConfigChecker[]} */ ([]);
    } else if (Array.isArray(partials)) {
        normalizeds = await Promise.all(
            partials.map((p) => normalizeChecker(p, { dir })),
        );
    } else if ("object" === typeof partials) {
        normalizeds = [await normalizeChecker(partials, { dir })];
    } else {
        throw new TypeError("'checkers' is incorrect type.");
    }
    return normalizeds;
};

/**
 * Normalise la configuration. La structure de l'objet JSON contenant la
 * configuration est souple pour rendre le fichier moins verbeux. Cette fonction
 * renseigne les valeurs par défaut pour les propriétés non-présentes.
 *
 * @param {any}    partial     L'objet JSON contenant la configuration.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             `metalint.config.js`.
 * @returns {Promise<NormalizedConfig>} La valeur normalisée.
 * @throws {TypeError} Si la configuration n'a pas le bon type.
 */
export const normalize = async (partial, { dir }) => {
    let normalized;
    if ("object" === typeof partial) {
        normalized = {
            patterns: normalizePatterns(partial.patterns),
            fix: normalizeFix(partial.fix),
            level: normalizeLevel(partial.level),
            reporters: await normalizeReporters(partial.reporters, { dir }),
            checkers: await normalizeCheckers(partial.checkers, { dir }),
        };
    } else {
        throw new TypeError("Configuration should be an object.");
    }
    return normalized;
};

export default normalize;
