"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/json-lint");

const DATA_DIR = "../data/lib/wrapper/json-lint";

describe("lib/wrapper/json-lint.js", function () {
    it("configure()", function () {
        const checker = linter.configure();
        assert.deepStrictEqual(checker, {
            "patterns": "**/*.json",
            "linters":  { "json-lint": null }
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/data1.json";
        const options = null;
        const level   = SEVERITY.INFO;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "json-lint",
                    "rule":      null,
                    "severity":  SEVERITY.ERROR,
                    "message":   "Unknown Character 'k', expecting a string" +
                                 " for key statement.",
                    "locations": [{ "line": 2, "column": 5 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/data2.json";
        const options = { "comment": true };
        const level   = SEVERITY.INFO;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/data3.json";
        const options = {};
        const level   = SEVERITY.WARN;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "json-lint",
                    "rule":      null,
                    "severity":  SEVERITY.ERROR,
                    "message":   "Unexpected End Of Array Error. Expecting a" +
                                 " value statement.",
                    "locations": [{ "line": 1, "column": 28 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/data.raw";
        const options = {};
        const level   = SEVERITY.FATAL;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
