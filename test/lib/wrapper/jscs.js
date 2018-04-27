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
            "patterns": "**/*.js",
            "linters":  { "jscs": {} }
        });
    });

    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure2/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "**/*.js",
            "linters":  { "jscs": "../.jscsrc" }
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script1.js";
        const options = {};
        const level   = SEVERITY.ERROR;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script2.js";
        const options = { "disallowMultipleLineStrings": true };
        const level   = SEVERITY.ERROR;

        return linter.wrapper(file, options, level).then(function (notices) {
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
        const options = { "disallowKeywords": ["var"] };
        const level   = SEVERITY.FATAL;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/README.md";
        const options = { "disallowSemicolons": true };
        const level   = SEVERITY.INFO;

        return linter.wrapper(file, options, level).then(function (notices) {
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
