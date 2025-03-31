/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

/**
 * La liste des sévérités.
 *
 * @type {Object<string, number>}
 */
const Severities = {
    FATAL: 1,
    ERROR: 2,
    WARN: 3,
    INFO: 4,
};

// Désactiver cette règle, car le parser du plugin JSDoc ne reconnaît pas le
// format `Foo[keyof Foo]`.
// https://github.com/jsdoc-type-pratt-parser/jsdoc-type-pratt-parser/issues/147
/* eslint-disable jsdoc/valid-types */
/**
 * @typedef {Severities[keyof Severities]} Severity Le type des sévérités.
 */
/* eslint-enable jsdoc/valid-types */

export default Severities;
