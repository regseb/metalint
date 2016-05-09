"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/jshint.js");

describe("lib/wrapper/jshint.js", function () {
    it("", function () {
        const source = "const results = [];";
        const options = { "esnext": true };
        const level = SEVERITY.ERROR;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const source = "if (1 == \"1\") console.log(\"Equal !\");\n";
        const options = { "eqeqeq": true };
        const level = SEVERITY.ERROR;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "jshint",
                    "rule":      "W116",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Expected '===' and instead saw '=='.",
                    "locations": [{ "line": 1, "column": 9 }]
                }
            ]);
        });
    });

    it("", function () {
        const source =
            "var maybe = \"I'm a string.\";\n" +
            "if (typeof maybe == \"fuction\") {\n" +
            "    console.log(\"It's a function.\");\n" +
            "}\n";
        const options = { "notypeof": false };
        const level = SEVERITY.FATAL;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const source =
            "function add(a, b) { return a + b; }\n" +
            "function sub(a, b) { return a - b; }\n";
        const options = { "maxerr":    1,
                          "maxparams": 1 };
        const level = SEVERITY.INFO;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "jshint",
                    "rule":      "W072",
                    "severity":  SEVERITY.ERROR,
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
