/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

/* @ts-self-types="../../../types/core/utils/object.d.ts" */

import "../../polyfills/iterator.js";

/**
 * Fusionne deux objets récursivement.
 *
 * @param {any} first  Le premier objet.
 * @param {any} second Le second objet.
 * @returns {any} La fusion des deux objets.
 */
export const merge = (first, second) => {
    if (
        first === second ||
        Object !== first?.constructor ||
        Object !== second?.constructor
    ) {
        return second;
    }

    const third = /** @type {Record<string, any>} */ ({});
    const keys = new Set(
        // @ts-expect-error -- TypeScript ne connait pas Iterator.concat().
        Iterator.concat(Object.keys(first), Object.keys(second)),
    );
    for (const key of keys) {
        // Si la propriété est dans les deux objets.
        if (Object.hasOwn(first, key) && Object.hasOwn(second, key)) {
            third[key] = merge(first[key], second[key]);
            // Si la propriété est seulement dans le premier objet.
        } else if (Object.hasOwn(first, key)) {
            third[key] = first[key];
            // Sinon la propriété est seulement dans le second objet.
        } else {
            third[key] = second[key];
        }
    }
    return third;
};
