/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

/* @ts-self-types="../../types/core/levels.d.ts" */

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

/**
 * @typedef {Levels[keyof Levels]} Level Le type des niveaux.
 */

export default Levels;
