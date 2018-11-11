"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/coffeelint");

const DATA_DIR = "test/data/lib/wrapper/coffeelint";

describe("lib/wrapper/coffeelint.js", function () {
    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure1/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "*.coffee",
            "linters":  { "coffeelint": null }
        });
    });

    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure2/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "*.coffee",
            "linters":  { "coffeelint": "../coffeelint.json" }
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script1.coffee";
        const level   = SEVERITY.INFO;
        const options = {};

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script2.coffee";
        const level   = SEVERITY.WARN;
        const options = {
            "no_tabs":                 { "level": "error" },
            "prefer_english_operator": { "level": "warn" }
        };

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "file":      file,
                    "linter":    "coffeelint",
                    "rule":      "prefer_english_operator",
                    "severity":  SEVERITY.WARN,
                    "message":   "Don't use &&, ||, ==, !=, or !",
                    "locations": [{ "line": 2 }]
                }, {
                    "file":      file,
                    "linter":    "coffeelint",
                    "rule":      "no_tabs",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Line contains tab indentation",
                    "locations": [{ "line": 2 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script3.coffee";
        const level   = SEVERITY.ERROR;
        const options = {
            "prefer_english_operator": { "level": "warn" }
        };

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script4.coffee";
        const level   = SEVERITY.FATAL;
        const options = {};

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
