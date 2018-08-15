"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/markdownlint");

const DATA_DIR = "test/data/lib/wrapper/markdownlint";

describe("lib/wrapper/markdownlint.js", function () {
    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure1/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "*.md",
            "linters":  { "markdownlint": null }
        });
    });

    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure2/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "*.md",
            "linters":  { "markdownlint": "../.markdownlintrc" }
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/README1.md";
        const level   = SEVERITY.INFO;
        const options = null;

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "file":      file,
                    "linter":    "markdownlint",
                    "rule":      "MD029/ol-prefix",
                    "message":   "Ordered list item prefix [Expected: 2;" +
                                 " Actual: 3; Style: 1/2/3]",
                    "locations": [{ "line": 4 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/README2.md";
        const level   = SEVERITY.INFO;
        const options = {};

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/README3.md";
        const level   = SEVERITY.WARN;
        const options = {};

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "file":      file,
                    "linter":    "markdownlint",
                    "rule":      "MD026/no-trailing-punctuation",
                    "message":   "Trailing punctuation in heading" +
                                 " [Punctuation: '!']",
                    "locations": [{ "line": 1 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/README4.md";
        const level   = SEVERITY.FATAL;
        const options = {};

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
