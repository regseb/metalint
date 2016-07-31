"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/eslint.js");

const DATA_DIR = "../data/lib/wrapper/eslint";

describe("lib/wrapper/eslint.js", function () {
    it("", function () {
        const file    = DATA_DIR + "/script1.js";
        const options = {
            "rules": {
                "indent":            [1, 4, { "SwitchCase": 1 }],
                "no-duplicate-case": 2
            }
        };
        const level   = SEVERITY.WARN;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "eslint",
                    "rule":      "indent",
                    "severity":  SEVERITY.WARN,
                    "message":   "Expected indentation of 4 space" +
                                 " characters but found 3.",
                    "locations": [{ "line": 4, "column": 4 }]
                }, {
                    "linter":    "eslint",
                    "rule":      "no-duplicate-case",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Duplicate case label.",
                    "locations": [{ "line": 5, "column": 5 }]
                }
            ]);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/script2.js";
        const options = { "rules": { "no-bitwise": 1 } };
        const level   = SEVERITY.ERROR;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/script3.js";
        const options = { };
        const level   = SEVERITY.INFO;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "eslint",
                    "rule":      null,
                    "severity":  SEVERITY.FATAL,
                    "message":   "Parsing error: Unexpected token ;",
                    "locations": [{ "line": 1, "column": 9 }]
                }
            ]);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/script4.js";
        const options = { };
        const level   = SEVERITY.OFF;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
