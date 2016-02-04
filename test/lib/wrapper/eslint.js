/* global require, describe, it */

"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/eslint.js");

describe("lib/wrapper/eslint.js", function () {
    it("", function () {
        const source =
            "var number = 1;\n" +
            "switch (number) {\n" +
            "    case 1: break;\n" +
            "   case 2: break;\n" +
            "    case 2: break;\n" +
            "}\n";
        const options = {
            "rules": {
                "indent": [1, 4, { "SwitchCase": 1 }],
                "no-duplicate-case": 2
            }
        };
        const level = SEVERITY.WARN;

        return wrapper(source, options, level).then(function (notices) {
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
        const source = "var x = 2 << 9;\n";
        const options = { "rules": { "no-bitwise": 1 } };
        const level = SEVERITY.ERROR;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const source = "var i = ;\n";
        const options = { };
        const level = SEVERITY.INFO;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "eslint",
                    "rule":      null,
                    "severity":  SEVERITY.FATAL,
                    "message":   "Parsing error: Unexpected token ;",
                    "locations": [{ "line": 1, "column": 10 }]
                }
            ]);
        });
    });

    it("", function () {
        const source =
            "int main(int argc, char* argv[]) {\n" +
            "    return 0;\n" +
            "}\n";
        const options = { };
        const level = SEVERITY.OFF;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
