/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import Levels from "../levels.js";
import { merge } from "../utils/object.js";

/**
 * @typedef {NodeJS.WritableStream} WritableStream
 * @typedef {import("../formatter/formatter.js").default} TypeofFormatter
 * @typedef {import("../../type/index.d.ts").FlattenedConfig} FlattenedConfig
 * @typedef {import("../../type/index.d.ts").FlattenedConfigChecker} FlattenedConfigChecker
 * @typedef {import("../../type/index.d.ts").FlattenedConfigLinter} FlattenedConfigLinter
 * @typedef {import("../../type/index.d.ts").FlattenedConfigOverride} FlattenedConfigOverride
 * @typedef {import("../../type/index.d.ts").FlattenedConfigReporter} FlattenedConfigReporter
 * @typedef {import("../../type/index.d.ts").Level} Level
 * @typedef {import("../../type/index.d.ts").NormalizedConfig} NormalizedConfig
 * @typedef {import("../../type/index.d.ts").NormalizedConfigChecker} NormalizedConfigChecker
 * @typedef {import("../../type/index.d.ts").NormalizedConfigLinter} NormalizedConfigLinter
 * @typedef {import("../../type/index.d.ts").NormalizedConfigOverride} NormalizedConfigOverride
 * @typedef {import("../../type/index.d.ts").NormalizedConfigReporter} NormalizedConfigReporter
 */

/**
 * Fusionne une propriété <code>"patterns"</code>.
 *
 * @param {string[]} hierarchies      La valeur d'une des propriétés
 *                                    <code>"patterns"</code>.
 * @param {Object}   context          Le contexte de la fusion.
 * @param {string[]} context.patterns La valeur de la propriété
 *                                    <code>"patterns"</code> parente.
 * @returns {string[]} La valeur fusionnée.
 */
export const flattenPatterns = function (hierarchies, { patterns }) {
    return [...patterns, ...hierarchies];
};

/**
 * Fusionne une propriété <code>"fix"</code>.
 *
 * @param {boolean|undefined} hierarchy   La valeur d'une des propriétés
 *                                        <code>"fix"</code>.
 * @param {Object}            context     Le contexte de la fusion.
 * @param {boolean|undefined} context.fix La valeur de la propriété
 *                                        <code>"fix"</code> parente.
 * @returns {boolean|undefined} La valeur fusionnée.
 */
export const flattenFix = function (hierarchy, { fix }) {
    return hierarchy ?? fix;
};

/**
 * Fusionne une propriété <code>"level"</code>.
 *
 * @param {Level}  hierarchy     La valeur d'une des propriétés
 *                               <code>"level"</code>.
 * @param {Object} context       Le contexte de la fusion.
 * @param {Level}  context.level La valeur de la propriété <code>"level"</code>
 *                               parente.
 * @returns {Level} La valeur fusionnée.
 */
export const flattenLevel = function (hierarchy, { level }) {
    return Math.min(hierarchy, level);
};

/**
 * Fusionne une propriété <code>"options"</code>.
 *
 * @param {Record<string, any>[]} hierarchies     La valeur d'une des propriétés
 *                                                <code>"options"</code>.
 * @param {Object}                context         Le contexte de la fusion.
 * @param {Record<string, any>}   context.options La valeur de la propriété
 *                                                <code>"options"</code>
 *                                                parente.
 * @returns {Record<string, any>} La valeur fusionnée.
 */
export const flattenOptions = function (hierarchies, { options }) {
    return [options, ...hierarchies].reduce(merge);
};

/**
 * Fusionne un élément de la propriété <code>"reporters"</code>.
 *
 * @param {NormalizedConfigReporter} hierarchy     La valeur de l'élément de la
 *                                                 propriété
 *                                                 <code>"reporters"</code>.
 * @param {Object}                   context       Le contexte de la fusion.
 * @param {Level}                    context.level La valeur de la propriété
 *                                                 <code>"level"</code>
 *                                                 parente.
 * @returns {FlattenedConfigReporter} La valeur fusionnée.
 */
export const flattenReporter = function (hierarchy, { level }) {
    return {
        formatter: hierarchy.formatter,
        level: flattenLevel(hierarchy.level, { level }),
        options: flattenOptions(hierarchy.options, { options: {} }),
    };
};

/**
 * Fusionne la propriété <code>"reporters"</code>.
 *
 * @param {NormalizedConfigReporter[]} hierarchies       La valeur de la
 *                                                       propriété
 *                                                       <code>"reporters"</code>.
 * @param {Object}                     context           Le contexte de la
 *                                                       fusion.
 * @param {TypeofFormatter}            context.formatter La valeur de la
 *                                                       propriété
 *                                                       <code>"formatter"</code>
 *                                                       parente.
 * @param {Level}                      context.level     La valeur de la
 *                                                       propriété
 *                                                       <code>"level"</code>
 *                                                       parente.
 * @returns {FlattenedConfigReporter[]} La valeur fusionnée.
 */
export const flattenReporters = function (hierarchies, { formatter, level }) {
    if (undefined === formatter) {
        return hierarchies.map((r) => flattenReporter(r, { level }));
    }

    return [
        {
            formatter,
            level,
            options: {},
        },
    ];
};

/**
 * Fusionne un élément d'une propriété <code>"linters"</code>.
 *
 * @param {NormalizedConfigLinter} hierarchy       La valeur de l'élément d'une
 *                                                 des propriétés
 *                                                 <code>"linters"</code>.
 * @param {Object}                 context         Le contexte de la fusion.
 * @param {boolean|undefined}      context.fix     La valeur de la propriété
 *                                                 <code>"fix"</code> parente.
 * @param {Level}                  context.level   La valeur de la propriété
 *                                                 <code>"level"</code>
 *                                                 parente.
 * @param {Record<string, any>}    context.options La valeur de la propriété
 *                                                 <code>"options"</code>
 *                                                 parente.
 * @returns {FlattenedConfigLinter} La valeur fusionnée.
 */
export const flattenLinter = function (hierarchy, { fix, level, options }) {
    return {
        wrapper: hierarchy.wrapper,
        fix: flattenFix(hierarchy.fix, { fix }),
        level: flattenLevel(hierarchy.level, { level }),
        options: flattenOptions(hierarchy.options, { options }),
    };
};

/**
 * Fusionne une propriété <code>"linters"</code>.
 *
 * @param {NormalizedConfigLinter[]} hierarchies   La valeur d'une des
 *                                                 propriétés
 *                                                 <code>"linters"</code>.
 * @param {Object}                   context       Le contexte de la fusion.
 * @param {boolean|undefined}        context.fix   La valeur de la propriété
 *                                                 <code>"fix"</code> parente.
 * @param {Level}                    context.level La valeur de la propriété
 *                                                 <code>"level"</code> parente.
 * @returns {FlattenedConfigLinter[]} La valeur fusionnée.
 */
export const flattenLinters = function (hierarchies, { fix, level }) {
    const map = new Map();
    for (const hierarchy of hierarchies) {
        if (map.has(hierarchy.wrapper)) {
            const linter = map.get(hierarchy.wrapper);
            map.set(
                hierarchy.wrapper,
                flattenLinter(hierarchy, {
                    fix: linter.fix,
                    level: linter.level,
                    options: linter.options,
                }),
            );
        } else {
            map.set(
                hierarchy.wrapper,
                flattenLinter(hierarchy, {
                    fix,
                    level,
                    options: {},
                }),
            );
        }
    }
    return Array.from(map.values());
};

/**
 * Fusionne un élément d'une propriété <code>"overrides"</code>.
 *
 * @param {NormalizedConfigOverride} hierarchy     La valeur de l'élément
 *                                                 d'une des propriétés
 *                                                 <code>"overrides"</code>.
 * @param {Object}                   context       Le contexte de la fusion.
 * @param {boolean|undefined}        context.fix   La valeur de la propriété
 *                                                 <code>"fix"</code> parente.
 * @param {Level}                    context.level La valeur de la propriété
 *                                                 <code>"level"</code>
 *                                                 parente.
 * @returns {FlattenedConfigOverride} La valeur fusionnée.
 */
export const flattenOverride = function (hierarchy, { fix, level }) {
    return {
        patterns: hierarchy.patterns,
        linters: flattenLinters(hierarchy.linters, {
            fix: flattenFix(hierarchy.fix, { fix }),
            level: flattenLevel(hierarchy.level, { level }),
        }),
    };
};

/**
 * Fusionne un élément de la propriété <code>"checkers"</code>.
 *
 * @param {NormalizedConfigChecker} hierarchy     La valeur de l'élément de la
 *                                                propriété
 *                                                <code>"checkers"</code>.
 * @param {Object}                  context       Le contexte de la fusion.
 * @param {boolean|undefined}       context.fix   La valeur de la propriété
 *                                                <code>"fix"</code> parente.
 * @param {Level}                   context.level La valeur de la propriété
 *                                                <code>"level"</code> parente.
 * @returns {FlattenedConfigChecker} La valeur fusionnée.
 */
export const flattenChecker = function (hierarchy, { fix, level }) {
    const base = {
        fix: flattenFix(hierarchy.fix, { fix }),
        level: flattenLevel(hierarchy.level, { level }),
    };

    return {
        patterns: hierarchy.patterns,
        linters: flattenLinters(hierarchy.linters, {
            fix: base.fix,
            level: base.level,
        }),
        overrides: hierarchy.overrides.map((o) =>
            flattenOverride(o, { fix: base.fix, level: base.level }),
        ),
    };
};

/**
 * Fusionne la configuration.
 *
 * @param {NormalizedConfig}  hierarchy      L'objet JSON normalisé contenant la
 *                                           configuration.
 * @param {Object}            argv           Certaines options de la ligne de
 *                                           commande.
 * @param {boolean|undefined} argv.fix       L'option <code>--fix</code> de la
 *                                           ligne de commande.
 * @param {TypeofFormatter}   argv.formatter L'option <code>--formatter</code>
 *                                           de la ligne de commande.
 * @param {Level}             argv.level     L'options <code>--level</code> de
 *                                           la ligne de commande.
 * @returns {FlattenedConfig} L'objet JSON fusionné.
 */
export const flatten = function (hierarchy, argv) {
    const fix = flattenFix(argv.fix, { fix: hierarchy.fix });
    const level = flattenLevel(argv.level ?? Levels.INFO, {
        level: hierarchy.level,
    });
    // TODO Vérifier que checkers n'est pas vide.
    return {
        patterns: hierarchy.patterns,
        reporters: flattenReporters(hierarchy.reporters, {
            formatter: argv.formatter,
            level,
        }),
        checkers: hierarchy.checkers.map((c) =>
            flattenChecker(c, { fix, level }),
        ),
    };
};

export default flatten;
