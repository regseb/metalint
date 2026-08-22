/**
 * @license MIT
 * @author Sébastien Règne
 */

if (undefined === Error.isError) {
    /**
     * Vérifie si un objet est une instance de la classe `Error`.
     *
     * @param {unknown} value Objet vérifié.
     * @returns {value is Error} `true` si c'est une `Error` ; sinon `false`.
     * @see https://developer.mozilla.org/Web/JavaScript/Reference/Global_Objects/Error/isError
     */
    // eslint-disable-next-line unicorn/prefer-error-is-error
    Error.isError = (value) => value instanceof Error;
}
