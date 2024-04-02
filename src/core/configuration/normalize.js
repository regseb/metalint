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
 * @typedef {import("../../types/configuration/normalized.d.ts").NormalizedConfig} NormalizedConfig
 * @typedef {import("../../types/configuration/normalized.d.ts").NormalizedConfigChecker} NormalizedConfigChecker
 * @typedef {import("../../types/configuration/normalized.d.ts").NormalizedConfigLinter} NormalizedConfigLinter
 * @typedef {import("../../types/configuration/normalized.d.ts").NormalizedConfigOverride} NormalizedConfigOverride
 * @typedef {import("../../types/configuration/normalized.d.ts").NormalizedConfigReporter} NormalizedConfigReporter
 * @typedef {import("../../types/level.d.ts").default} Level
 * @typedef {import("../../types/typeofformatter.d.ts").default} TypeofFormatter
 * @typedef {import("../../types/typeofwrapper.d.ts").default} TypeofWrapper
 */

/**
 * Lit un fichier JavaScript exportant un objet JSON.
 *
 * @param {string} file L'adresse du fichier qui sera lu.
 * @returns {Promise<Record<string, unknown>>} L'objet JSON récupéré.
 */
const read = async function (file) {
    try {
        // eslint-disable-next-line no-unsanitized/method
        const module = await import(pathToFileURL(file).href);
        return module.default;
    } catch (err) {
        throw new Error(`Cannot import '${file}'.`, { cause: err });
    }
};

/**
 * Normalise une propriété <code>"patterns"</code>.
 *
 * @param {*}        partials     La valeur d'un des propriétés
 *                                <code>"patterns"</code>.
 * @param {Object}   context      Le contexte de la propriété.
 * @param {string[]} context.auto La valeur par défaut.
 * @returns {string[]} La valeur normalisée.
 * @throws {TypeError} Si le <code>"patterns"</code> n'a pas le bon type.
 */
export const normalizePatterns = function (partials, { auto }) {
    let normalized;
    if (undefined === partials) {
        normalized = auto;
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
 * Normalise une propriété <code>"fix"</code>.
 *
 * @param {*} partial La valeur d'une propriété <code>"fix"</code>.
 * @returns {boolean|undefined} La valeur normalisée.
 * @throws {TypeError} Si le <code>"fix"</code> n'a pas le bon type.
 */
export const normalizeFix = function (partial) {
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
 * Normalise une propriété <code>"level"</code>.
 *
 * @param {*} partial La valeur d'une propriété <code>"level"</code>.
 * @returns {Level} La valeur normalisée.
 * @throws {Error}     Si le <code>"level"</code> est invalide.
 * @throws {TypeError} Si le <code>"level"</code> n'a pas le bon type.
 */
export const normalizeLevel = function (partial) {
    let normalized;
    if (undefined === partial) {
        normalized = Levels.INFO;
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
            normalized = partial;
        } else {
            throw new Error(
                "Value of property 'level' is unknown (possibles values:" +
                    " Level.OFF, Level.FATAL, Level.ERROR, Level.WARN and" +
                    " Level.INFO).",
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
 * Normalise une propriété <code>"formatter"</code>.
 *
 * @param {*} partial La valeur d'une propriété <code>"formatter"</code>.
 * @returns {Promise<TypeofFormatter>} La valeur normalisée.
 * @throws {Error}     Si le <code>"formatter"</code> est invalide.
 * @throws {TypeError} Si le <code>"formatter"</code> n'a pas le bon type.
 */
export const normalizeFormatter = async function (partial) {
    let normalized;
    if (undefined === partial) {
        const imported = await import("../formatter/console.js");
        normalized = imported.default;
    } else if ("string" === typeof partial) {
        if (FORMATTERS.includes(partial.toLowerCase())) {
            // eslint-disable-next-line no-unsanitized/method
            const imported = await import(
                `../formatter/${partial.toLowerCase()}.js`
            );
            normalized = imported.default;
        } else {
            throw new Error(
                "Value of property 'formatter' is unknown (possibles" +
                    ` values: "${FORMATTERS.join('", "')}").`,
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
 * Normalise une propriété <code>"options"</code>.
 *
 * @param {*}      partial     La valeur d'une propriété <code>"options"</code>.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             <code>metalint.config.js</code>.
 * @returns {Promise<Record<string, unknown>>} La valeur normalisée.
 * @throws {TypeError} Si l'<code>"options"</code> n'a pas le bon type.
 */
export const normalizeOption = async function (partial, { dir }) {
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
 * Normalise une propriété <code>"options"</code>.
 *
 * @param {*}      partials    La valeur d'une propriété <code>"options"</code>.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             <code>metalint.config.js</code>.
 * @returns {Promise<Record<string, unknown>[]>} La valeur normalisée.
 * @throws {TypeError} Si l'<code>"options"</code> n'a pas le bon type.
 */
export const normalizeOptions = async function (partials, { dir }) {
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
 * Normalise la propriété <code>"reporters"</code>.
 *
 * @param {*}      partial     La valeur de la propriété
 *                             <code>"reporter"</code>.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             <code>metalint.config.js</code>.
 * @returns {Promise<NormalizedConfigReporter>} La valeur normalisée.
 * @throws {TypeError} Si le <code>"reporters"</code> n'a pas le bon type.
 */
export const normalizeReporter = async function (partial, { dir }) {
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
 * Normalise la propriété <code>"reporters"</code>.
 *
 * @param {*}      partials    La valeur de la propriété
 *                             <code>"reporter"</code>.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             <code>metalint.config.js</code>.
 * @returns {Promise<NormalizedConfigReporter[]>} La valeur normalisée.
 * @throws {TypeError} Si le <code>"reporters"</code> n'a pas le bon type.
 */
export const normalizeReporters = async function (partials, { dir }) {
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
 * Normalise une propriété <code>"wrapper"</code>.
 *
 * @param {*} partial La valeur d'une propriété <code>"wrapper"</code>.
 * @returns {Promise<TypeofWrapper>} La valeur normalisée.
 * @throws {TypeError} Si le <code>"reporters"</code> n'a pas le bon type.
 */
export const normalizeWrapper = async function (partial) {
    let normalized;
    if ("string" === typeof partial) {
        if (WRAPPERS.includes(partial.toLowerCase())) {
            // eslint-disable-next-line no-unsanitized/method
            const imported = await import(
                `../wrapper/${partial.toLowerCase()}.js`
            );
            normalized = imported.default;
        } else {
            throw new Error(
                "Value of property 'wrapper' is unknown (possibles" +
                    ` values: "${WRAPPERS.join('", "')}").`,
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
 * Normalise une propriété <code>"linters"</code>.
 *
 * @param {*}      partial     La valeur d'une propriété <code>"linters"</code>.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             <code>metalint.config.js</code>.
 * @returns {Promise<NormalizedConfigLinter>} La valeur normalisée.
 * @throws {TypeError} Si le <code>"linters"</code> n'a pas le bon type.
 */
export const normalizeLinter = async function (partial, { dir }) {
    let normalized;
    if ("string" === typeof partial) {
        // Chercher un "_" entouré de lettres ou de chiffres pour éviter les
        // faux positifs des linters avec un double "__".
        const name = /[0-9a-z]_[0-9a-z]/u.test(partial)
            ? partial.slice(0, partial.search(/[0-9a-z]_[0-9a-z]/u) + 1)
            : partial;
        normalized = {
            wrapper: await normalizeWrapper(name),
            fix: normalizeFix(undefined),
            level: normalizeLevel(undefined),
            options: await normalizeOptions(`${partial}.config.js`, { dir }),
        };
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
 * Normalise une propriété <code>"linters"</code>.
 *
 * @param {*}      partials    La valeur d'une propriété <code>"linters"</code>.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             <code>metalint.config.js</code>.
 * @returns {Promise<NormalizedConfigLinter[]>} La valeur normalisée.
 * @throws {TypeError} Si le <code>"linters"</code> n'a pas le bon type.
 */
export const normalizeLinters = async function (partials, { dir }) {
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
 * Normalise une propriété <code>"overrides"</code>.
 *
 * @param {*}      partial     La valeur d'une propriété
 *                             <code>"overrides"</code>.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             <code>metalint.config.js</code>.
 * @returns {Promise<NormalizedConfigOverride>} La valeur normalisée.
 * @throws {TypeError} Si le <code>"overrides"</code> n'a pas le bon type.
 */
export const normalizeOverride = async function (partial, { dir }) {
    let normalized;
    if ("object" === typeof partial) {
        normalized = {
            patterns: normalizePatterns(partial.patterns, { auto: ["**"] }),
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
 * Normalise une propriété <code>"overrides"</code>.
 *
 * @param {*}      partials    La valeur d'une propriété
 *                             <code>"overrides"</code>.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             <code>metalint.config.js</code>.
 * @returns {Promise<NormalizedConfigOverride[]>} La valeur normalisée.
 * @throws {TypeError} Si le <code>"overrides"</code> n'a pas le bon type.
 */
export const normalizeOverrides = async function (partials, { dir }) {
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
 * Normalise la propriété <code>"checkers"</code>.
 *
 * @param {*}      partial     La valeur de la propriété
 *                             <code>"checkers"</code>.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             <code>metalint.config.js</code>.
 * @returns {Promise<NormalizedConfigChecker>} La valeur normalisée.
 * @throws {TypeError} Si le <code>"checkers"</code> n'a pas le bon type.
 */
export const normalizeChecker = async function (partial, { dir }) {
    let normalized;
    if ("object" === typeof partial) {
        normalized = {
            patterns: normalizePatterns(partial.patterns, { auto: ["**"] }),
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
 * Normalise la propriété <code>"checkers"</code>.
 *
 * @param {*}      partials    La valeur de la propriété
 *                             <code>"checkers"</code>.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             <code>metalint.config.js</code>.
 * @returns {Promise<NormalizedConfigChecker[]>} La valeur normalisée.
 * @throws {TypeError} Si le <code>"checkers"</code> n'a pas le bon type.
 */
export const normalizeCheckers = async function (partials, { dir }) {
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
 * @param {*}      partial     L'objet JSON contenant la configuration.
 * @param {Object} context     Le context de la propriété.
 * @param {string} context.dir Le répertoire où se trouve le fichier
 *                             <code>metalint.config.js</code>.
 * @returns {Promise<NormalizedConfig>} La valeur normalisée.
 * @throws {TypeError} Si la configuration n'a pas le bon type.
 */
export const normalize = async function (partial, { dir }) {
    let normalized;
    if ("object" === typeof partial) {
        normalized = {
            patterns: normalizePatterns(partial.patterns, { auto: [] }),
            fix: normalizeFix(partial.fix) ?? false,
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
