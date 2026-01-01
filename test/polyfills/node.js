/**
 * @license MIT
 * @author Sébastien Règne
 */

if (undefined === RegExp.escape) {
    /**
     * Échappe les caractères spéciaux d'une expression régulière.
     *
     * @param {string} text Le texte à échapper.
     * @returns {string} Le texte échappé.
     * @see https://developer.mozilla.org/Web/JavaScript/Reference/Global_Objects/RegExp/escape
     */
    RegExp.escape = (text) => {
        return text
            .replaceAll(/[$\(\)*+.?\[\\\]^\{\|\}]/gv, String.raw`\$&`)
            .replaceAll(",", String.raw`\x2c`);
    };
}
