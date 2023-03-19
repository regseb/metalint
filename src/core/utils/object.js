/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

/**
 * Fusionne deux objets.
 *
 * @param {*} first  Le premier objet.
 * @param {*} second Le second objet.
 * @returns {*} La fusion des deux objets.
 */
export const merge = function (first, second) {
    let third;

    if (
        "object" === typeof first &&
        !Array.isArray(first) &&
        "object" === typeof second &&
        !Array.isArray(second)
    ) {
        third = {};
        for (const key of new Set([
            ...Object.keys(first),
            ...Object.keys(second),
        ])) {
            // Si la propriété est dans les deux objets.
            if (key in first && key in second) {
                third[key] = merge(first[key], second[key]);
                // Si la propriété est seulement dans le premier objet.
            } else if (key in first) {
                third[key] = first[key];
                // Si la propriété est seulement dans le second objet.
            } else {
                third[key] = second[key];
            }
        }
    } else {
        third = second;
    }

    return third;
};
