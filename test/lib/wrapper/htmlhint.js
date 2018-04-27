"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/htmlhint");

const DATA_DIR = "../data/lib/wrapper/htmlhint";

describe("lib/wrapper/htmlhint.js", function () {
    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure1/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "**/*.html",
            "linters":  { "htmlhint": null }
        });
    });

    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure2/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "**/*.html",
            "linters":  { "htmlhint": "../.htmlhintrc" }
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/index1.html";
        const options = null;
        const level   = SEVERITY.INFO;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/index2.html";
        const options = {};
        const level   = SEVERITY.WARN;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "htmlhint",
                    "rule":      "doctype-first",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Doctype must be declared first.",
                    "locations": [{ "line": 1, "column": 1 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/index3.html";
        const options = { "head-script-disabled": true };
        const level   = SEVERITY.ERROR;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/index.tex";
        const options = {};
        const level   = SEVERITY.FATAL;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
