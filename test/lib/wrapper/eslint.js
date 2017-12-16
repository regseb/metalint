"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const linter   = require("../../../lib/wrapper/eslint.js");

const DATA_DIR = "../data/lib/wrapper/eslint";

describe("lib/wrapper/eslint.js", function () {
    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure1/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "**/*.js",
            "linters":  { "eslint": null }
        });
    });

    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure2/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "**/*.js",
            "linters":  { "eslint": "../.eslintrc" }
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script1.js";
        const options = null;
        const level   = SEVERITY.INFO;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script2.js";
        const options = {
            "rules": {
                "indent":            [1, 4, { "SwitchCase": 1 }],
                "no-duplicate-case": 2
            }
        };
        const level   = SEVERITY.WARN;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "eslint",
                    "rule":      "indent",
                    "severity":  SEVERITY.WARN,
                    "message":   "Expected indentation of 4 spaces but found" +
                                 " 3.",
                    "locations": [{ "line": 4, "column": 1 }]
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

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script3.js";
        const options = { "rules": { "no-bitwise": 1 } };
        const level   = SEVERITY.ERROR;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script4.js";
        const options = {};
        const level   = SEVERITY.INFO;

        return linter.wrapper(file, options, level).then(function (notices) {
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

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script5.js";
        const options = {};
        const level   = SEVERITY.OFF;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
