/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

/* @ts-self-types="../../types/polyfills/iterator.d.ts" */

if (!("concat" in Iterator)) {
    /**
     * Concatène les valeurs de plusieurs itérateurs.
     *
     * @param {...Iterable<any>} its Liste des itérateurs à concaténer.
     * @returns {IteratorObject<any>} Itérateur contenant les valeurs des
     *                                itérateurs.
     * @see https://developer.mozilla.org/Web/JavaScript/Reference/Global_Objects/Iterator/concat
     */
    // @ts-expect-error -- Ajouter une prothèse dans la classe Iterator.
    Iterator.concat = (...its) => {
        return Iterator.from(its.flat());
    };
}
