/* global module */

"use strict";

/**
 * La liste des sévérités.
 */
let SEVERITY = {
    "OFF":   0,
    "FATAL": 1,
    "ERROR": 2,
    "WARN":  3,
    "INFO":  4
};

// Exposer la liste des sévérités.
module.exports = SEVERITY;
