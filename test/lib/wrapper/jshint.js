"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/jshint");

const DATA_DIR = "../data/lib/wrapper/jshint";

describe("lib/wrapper/jshint.js", function () {
    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure1/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "**/*.js",
            "linters":  { "jshint": null }
        });
    });

    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure2/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "**/*.js",
            "linters":  { "jshint": "../.jshintrc" }
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script1.js";
        const options = null;
        const level   = SEVERITY.ERROR;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "jshint",
                    "rule":      "W061",
                    "severity":  SEVERITY.WARN,
                    "message":   "eval can be harmful.",
                    "locations": [{ "column": 1, "line": 1 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script2.js";
        const options = { "esnext": true };
        const level   = SEVERITY.ERROR;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script3.js";
        const options = { "eqeqeq": true };
        const level   = SEVERITY.ERROR;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "jshint",
                    "rule":      "W116",
                    "severity":  SEVERITY.WARN,
                    "message":   "Expected '===' and instead saw '=='.",
                    "locations": [{ "line": 1, "column": 9 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script4.js";
        const options = { "notypeof": false };
        const level   = SEVERITY.FATAL;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script5.js";
        const options = { "maxerr": 1, "maxparams": 1 };
        const level   = SEVERITY.INFO;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "jshint",
                    "rule":      "W072",
                    "severity":  SEVERITY.WARN,
                    "message":   "This function has too many parameters. (2)",
                    "locations": [{ "line": 1, "column": 13 }]
                }, {
                    "linter":    "jshint",
                    "rule":      "E043",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Too many errors. (33% scanned).",
                    "locations": [{ "line": 1, "column": 13 }]
                }
            ]);
        });
    });
});
