/* global require, module */

var wrappers = {
    "checkstyle": require("./reporter/checkstyle"),
    "console":    require("./reporter/console"),
    "json":       require("./reporter/json"),
    "unix":       require("./reporter/unix")
};

module.exports = wrappers;
