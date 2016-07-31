"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/stylelint.js");

describe("lib/wrapper/stylelint.js", function () {
    it("", function () {
        const source = "a { color: #FF9800; }";
        const options = { "rules": { "color-hex-case": "upper" } };
        const level = SEVERITY.INFO;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const source = "p { font-size: .5em }";
        const options = {
            "rules": {
                "number-leading-zero": ["always", { "severity": "warning" }]
            }
        };
        const level = SEVERITY.WARN;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "stylelint",
                    "rule":      "number-leading-zero",
                    "severity":  SEVERITY.WARN,
                    "message":   "Expected a leading zero",
                    "locations": [{ "line": 1, "column": 15 }]
                }
            ]);
        });
    });

    it("", function () {
        const source =
            "label::after {\n" +
            "    content: ' : ';\n" +
            "}\n";
        const options = {
            "rules": {
                "string-quotes": "double",
                "indentation":   [2, { "severity": "warning" }]
            }
        };
        const level = SEVERITY.ERROR;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "stylelint",
                    "rule":      "string-quotes",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Expected double quotes",
                    "locations": [{ "line": 2, "column": 14 }]
                }
            ]);
        });
    });

    it("", function () {
        const source =
            "p {\n" +
            "    text-align: justify;;\n" +
            "}\n";
        const options = { "rules": { "no-extra-semicolons": true } };
        const level = SEVERITY.FATAL;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
