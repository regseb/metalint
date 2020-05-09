"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/jshint");

const DATA_DIR = "test/data/lib/wrapper/jshint";

describe("lib/wrapper/jshint.js", function () {
    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure1/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            patterns: "*.js",
            linters:  { jshint: null },
        });
    });

    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure2/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            patterns: "*.js",
            linters:  { jshint: "../.jshintrc" },
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script1.js";
        const level   = SEVERITY.WARN;
        const options = null;

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    file:      file,
                    linter:    "jshint",
                    rule:      "W061",
                    severity:  SEVERITY.WARN,
                    message:   "eval can be harmful.",
                    locations: [{ line: 1, column: 1 }],
                },
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script2.js";
        const level   = SEVERITY.ERROR;
        const options = { esnext: true };

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script3.js";
        const level   = SEVERITY.WARN;
        const options = { eqeqeq: true };

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    file:      file,
                    linter:    "jshint",
                    rule:      "W116",
                    severity:  SEVERITY.WARN,
                    message:   "Expected '===' and instead saw '=='.",
                    locations: [{ line: 1, column: 9 }],
                },
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script4.js";
        const level   = SEVERITY.FATAL;
        const options = { notypeof: false };

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script5.js";
        const level   = SEVERITY.INFO;
        const options = { maxerr: 1, maxparams: 1 };

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    file:      file,
                    linter:    "jshint",
                    rule:      "W072",
                    severity:  SEVERITY.WARN,
                    message:   "This function has too many parameters. (2)",
                    locations: [{ line: 1, column: 13 }],
                }, {
                    file:      file,
                    linter:    "jshint",
                    rule:      "E043",
                    severity:  SEVERITY.ERROR,
                    message:   "Too many errors. (33% scanned).",
                    locations: [{ line: 1, column: 13 }],
                },
            ]);
        });
    });
});
