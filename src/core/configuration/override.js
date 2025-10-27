/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import { flattenFix, flattenLevel, flattenOptions } from "./flatten.js";

/**
 * @import { FlattenedConfigLinter } from "./flatten.js"
 */

/**
 * Surcharge un linter.
 *
 * @param {FlattenedConfigLinter} parent La valeur parente du linter.
 * @param {FlattenedConfigLinter} child  La valeur enfante du linter.
 * @returns {FlattenedConfigLinter} La valeur surchargée.
 */
const mergeLinter = (parent, child) => {
    return {
        wrapper: parent.wrapper,
        fix: flattenFix(child.fix, { fix: parent.fix }),
        level: flattenLevel(child.level, { level: parent.level }),
        options: flattenOptions([child.options], { options: parent.options }),
    };
};

/**
 * Surcharge des linters.
 *
 * @param {FlattenedConfigLinter[]} parents  Les valeurs parentes des linters.
 * @param {FlattenedConfigLinter[]} children Les valeurs enfantes des linters.
 * @returns {FlattenedConfigLinter[]} Les valeurs surchargées.
 */
export const mergeLinters = (parents, children) => {
    const map = new Map();
    for (const linter of [...parents, ...children]) {
        if (map.has(linter.wrapper)) {
            const parent = map.get(linter.wrapper);
            map.set(linter.wrapper, mergeLinter(parent, linter));
        } else {
            map.set(linter.wrapper, linter);
        }
    }
    return Array.from(map.values());
};
