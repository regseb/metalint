import { Writable } from "node:stream";

export default class extends Writable {

    /**
     * @type {string[]}
     */
    #chunks = [];

    /**
     * Écrit du texte dans le flux.
     *
     * @param {string}   chunk     Le texte écrit.
     * @param {string}   _encoding L'encodage du texte.
     * @param {Function} callback  La fonction appelée après que le texte soit
     *                             écrit.
     */
    _write(chunk, _encoding, callback) {
        this.#chunks.push(chunk);
        callback();
    }

    /**
     * Retourne la concaténation des textes.
     *
     * @returns {string} La concaténation des textes.
     */
    toString() {
        return this.#chunks.join("");
    }
}