/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import Severities from "./severities.js";

/**
 * @typedef {import("./severities.js").Severity} Severity
 */

/**
 * @typedef {0|Severity} Level Le type des niveaux.
 */

/**
 * La liste des niveaux.
 *
 * @type {Object<string, Level>}
 */
export default {
    OFF: 0,
    ...Severities,
};
