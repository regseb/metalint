/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

/* @ts-self-types="../../../types/core/utils/array.d.ts" */

/**
 * Empaquette un élément dans un tableau si ce n'est pas déjà un tableau.
 *
 * @template T Le type de l'élément ou des éléments du tableau.
 * @param {T | T[]} value L'élément.
 * @returns {T[]} Un tableau avec seulement l'élément d'entrée ; ou le tableau
 *                d'entrée.
 */
export const wrap = (value) => {
    return Array.isArray(value) ? value : [value];
};
