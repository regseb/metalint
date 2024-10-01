/**
 * @license MIT
 * @author Sébastien Règne
 */

/**
 * @import { Linter } from "eslint"
 */

/**
 * @type {Linter.Config}
 */
export default {
    rules: {
        // Plugin eslint-plugin-unicorn.
        // Désactiver cette règle pour les wrappers, car ils doivent avoir le
        // même nom que les packages npm (en transformant "@foo/bar" en
        // "foo__bar").
        "unicorn/filename-case": "off",
    },
};
