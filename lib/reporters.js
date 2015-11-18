/* global require, module */

"use strict";

/**
 * La liste des rapporteurs.
 */
let wrappers = {
    "checkstyle": require("./reporter/checkstyle"),
    "console":    require("./reporter/console"),
    "csv":        require("./reporter/csv"),
    "json":       require("./reporter/json"),
    "unix":       require("./reporter/unix")
};

// Exposer la liste des rapporteurs.
module.exports = wrappers;
