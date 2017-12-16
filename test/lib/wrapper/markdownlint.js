"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const linter   = require("../../../lib/wrapper/markdownlint.js");

const DATA_DIR = "../data/lib/wrapper/markdownlint";

describe("lib/wrapper/markdownlint.js", function () {
    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure1/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "**/*.md",
            "linters":  { "markdownlint": null }
        });
    });

    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure2/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "**/*.md",
            "linters":  { "markdownlint": "../.markdownlintrc" }
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/README1.md";
        const options = null;
        const level   = SEVERITY.INFO;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "markdownlint",
                    "rule":      "MD029/ol-prefix",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Ordered list item prefix [Expected: 2;" +
                                 " Actual: 3; Style: 1/2/3]",
                    "locations": [{ "line": 4 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/README2.md";
        const options = {};
        const level   = SEVERITY.INFO;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/README3.md";
        const options = {};
        const level   = SEVERITY.WARN;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "markdownlint",
                    "rule":      "MD026/no-trailing-punctuation",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Trailing punctuation in header" +
                                 " [Punctuation: '!']",
                    "locations": [{ "line": 1 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/README4.md";
        const options = {};
        const level   = SEVERITY.FATAL;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
