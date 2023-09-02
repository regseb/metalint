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
 * @returns {T[]} Un tableau avec seulement l'élément d'entrée ou l'élément.
 */
export const wrap = function (value) {
    return Array.isArray(value) ? value : [value];
};
