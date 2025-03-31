/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import Severities from "./severities.js";

/**
 * La liste des niveaux.
 *
 * @type {Object<string, number>}
 */
const Levels = {
    OFF: 0,
    ...Severities,
};

// Désactiver cette règle, car le parser du plugin JSDoc ne reconnaît pas le
// format `Foo[keyof Foo]`.
// https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/issues/147
/* eslint-disable jsdoc/valid-types */
/**
 * @typedef {Levels[keyof Levels]} Level Le type des niveaux.
 */
/* eslint-enable jsdoc/valid-types */

export default Levels;
