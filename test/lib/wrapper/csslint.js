"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/csslint");

const DATA_DIR = "../data/lib/wrapper/csslint";

describe("lib/wrapper/csslint.js", function () {
    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure1/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "**/*.css",
            "linters":  { "csslint": null }
        });
    });

    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure2/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "**/*.css",
            "linters":  { "csslint": "../.csslintrc" }
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/style1.css";
        const options = null;
        const level   = SEVERITY.FATAL;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/style2.css";
        const options = { "floats": true };
        const level   = SEVERITY.INFO;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/style3.css";
        const options = { "empty-rules": true };
        const level   = SEVERITY.WARN;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "csslint",
                    "rule":      "empty-rules",
                    "severity":  SEVERITY.WARN,
                    "message":   "Rule is empty.",
                    "locations": [{ "line": 1, "column": 1 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/style4.css";
        const options = { "ids": 2, "important": 1 };
        const level   = SEVERITY.ERROR;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "csslint",
                    "rule":      "ids",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Don't use IDs in selectors.",
                    "locations": [{ "line": 1, "column": 1 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/style4.css";
        const options = { "zero-units": 2 };
        const level   = SEVERITY.FATAL;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
