/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

export default {
    rules: {
        // Plugin eslint-plugin-unicorn.
        // Désactiver cette règles pour les wrappers car ils doivent avoir le
        // même nom que les packages npm (en transformant "@foo/bar" en
        // "foo__bar").
        "unicorn/filename-case": "off",
    },
};