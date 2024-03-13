/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

// @ts-ignore https://github.com/prettier/plugin-xml/issues/671
import pluginXML from "@prettier/plugin-xml";

/**
 * @type {import("prettier").Config}
 */
export default {
    plugins: [pluginXML],

    // Options spécifiques du plugin XML.
    xmlQuoteAttributes: "double",
};
