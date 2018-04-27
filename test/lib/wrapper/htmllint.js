"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/htmllint");

const DATA_DIR = "../data/lib/wrapper/htmllint";

describe("lib/wrapper/htmllint.js", function () {
    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure1/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "**/*.html",
            "linters":  { "htmllint": null }
        });
    });

    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure2/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "**/*.html",
            "linters":  { "htmllint": "../.htmllintrc" }
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/index1.html";
        const options = null;
        const level   = SEVERITY.INFO;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "htmllint",
                    "rule":      "attr-name-style",
                    "severity":  SEVERITY.ERROR,
                    "message":   "E002",
                    "locations": [{ "line": 2, "column": 8 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/index2.html";
        const options = {};
        const level   = SEVERITY.INFO;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/index3.html";
        const options = {};
        const level   = SEVERITY.WARN;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "htmllint",
                    "rule":      "attr-quote-style",
                    "severity":  SEVERITY.ERROR,
                    "message":   "E005",
                    "locations": [{ "line": 1, "column": 13 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/index4.html";
        const options = {};
        const level   = SEVERITY.FATAL;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
