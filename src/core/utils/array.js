/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

/**
 * Empaquette un élément dans un tableau si ce n'est pas déjà un tableau.
 *
 * @template T
 * @param {T|T[]} value L'élément.
 * @returns {T[]} Un avec seulement l'élément d'entré ou l'élément.
 */
export const wrap = function (value) {
    return Array.isArray(value) ? value : [value];
};
