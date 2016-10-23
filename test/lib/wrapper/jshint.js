"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/jshint.js");

const DATA_DIR = "../data/lib/wrapper/jshint";

describe("lib/wrapper/jshint.js", function () {
    it("", function () {
        const file    = DATA_DIR + "/script1.js";
        const options = { "esnext": true };
        const level   = SEVERITY.ERROR;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/script2.js";
        const options = { "eqeqeq": true };
        const level   = SEVERITY.ERROR;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "jshint",
                    "rule":      "W116",
                    "severity":  SEVERITY.WARN,
                    "message":   "Expected '===' and instead saw '=='.",
                    "locations": [{ "line": 1, "column": 9 }]
                }
            ]);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/script3.js";
        const options = { "notypeof": false };
        const level   = SEVERITY.FATAL;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/script4.js";
        const options = { "maxerr": 1, "maxparams": 1 };
        const level   = SEVERITY.INFO;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "jshint",
                    "rule":      "W072",
                    "severity":  SEVERITY.WARN,
                    "message":   "This function has too many parameters. (2)",
                    "locations": [{ "line": 1, "column": 13 }]
                }, {
                    "linter":    "jshint",
                    "rule":      "E043",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Too many errors. (33% scanned).",
                    "locations": [{ "line": 1, "column": 13 }]
                }
            ]);
        });
    });
});
