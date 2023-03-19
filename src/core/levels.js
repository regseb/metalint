/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import Severities from "./severities.js";

/**
 * La liste des niveaux.
 *
 * @readonly
 * @enum {number}
 */
export default {
    OFF: 0,
    ...Severities,
};
