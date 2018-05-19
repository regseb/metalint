"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/jscs");

const DATA_DIR = "../data/lib/wrapper/jscs";

describe("lib/wrapper/jscs.js", function () {
    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure1/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "*.js",
            "linters":  { "jscs": {} }
        });
    });

    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure2/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "*.js",
            "linters":  { "jscs": "../.jscsrc" }
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script1.js";
        const level   = SEVERITY.ERROR;
        const options = {};

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script2.js";
        const level   = SEVERITY.ERROR;
        const options = { "disallowMultipleLineStrings": true };

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "jscs",
                    "rule":      "disallowMultipleLineStrings",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Multiline strings are disallowed.",
                    "locations": [{ "line": 2, "column": 4 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script3.js";
        const level   = SEVERITY.FATAL;
        const options = { "disallowKeywords": ["var"] };

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/README.md";
        const level   = SEVERITY.INFO;
        const options = { "disallowSemicolons": true };

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "jscs",
                    "rule":      "parseError",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Unterminated string constant (1:1)",
                    "locations": [{ "line": 1, "column": 1 }]
                }
            ]);
        });
    });
});
