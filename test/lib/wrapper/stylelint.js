"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const linter   = require("../../../lib/wrapper/stylelint.js");

const DATA_DIR = "../data/lib/wrapper/stylelint";

describe("lib/wrapper/stylelint.js", function () {
    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure1/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "**/*.css",
            "linters":  { "stylelint": { "rules": {} } }
        });
    });

    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure2/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "**/*.css",
            "linters":  { "stylelint": "../.stylelintrc" }
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/style1.css";
        const options = { "rules": {} };
        const level   = SEVERITY.INFO;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/style2.css";
        const options = { "rules": { "color-hex-case": "upper" } };
        const level   = SEVERITY.INFO;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/style3.css";
        const options = {
            "rules": {
                "number-leading-zero": ["always", { "severity": "warning" }]
            }
        };
        const level   = SEVERITY.WARN;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "stylelint",
                    "rule":      "number-leading-zero",
                    "severity":  SEVERITY.WARN,
                    "message":   "Expected a leading zero",
                    "locations": [{ "line": 1, "column": 16 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/style4.css";
        const options = {
            "rules": {
                "string-quotes": "double",
                "indentation":   [2, { "severity": "warning" }]
            }
        };
        const level   = SEVERITY.ERROR;

        return linter.wrapper(file, options, level).then(function (notices) {
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

    it("wrapper()", function () {
        const file    = DATA_DIR + "/style5.css";
        const options = { "rules": { "no-extra-semicolons": true } };
        const level   = SEVERITY.FATAL;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
