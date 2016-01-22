/* global require, module */

"use strict";

/**
 * La liste des rapporteurs.
 */
const wrappers = {
    "checkstyle": require("./reporter/checkstyle"),
    "console":    require("./reporter/console"),
    "csv":        require("./reporter/csv"),
    "json":       require("./reporter/json"),
    "none":       require("./reporter/none"),
    "unix":       require("./reporter/unix")
};

// Exposer la liste des rapporteurs.
module.exports = wrappers;
