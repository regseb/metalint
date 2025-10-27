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

/**
 * @typedef {Severities[keyof Severities]} Severity Le type des sévérités.
 */

export default Severities;
