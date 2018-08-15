"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/json-lint");

const DATA_DIR = "test/data/lib/wrapper/json-lint";

describe("lib/wrapper/json-lint.js", function () {
    it("configure()", function () {
        const checker = linter.configure();
        assert.deepStrictEqual(checker, {
            "patterns": "*.json",
            "linters":  { "json-lint": null }
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/data1.json";
        const level   = SEVERITY.INFO;
        const options = null;

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "file":      file,
                    "linter":    "json-lint",
                    "message":   "Unknown Character 'k', expecting a string" +
                                 " for key statement.",
                    "locations": [{ "line": 2, "column": 5 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/data2.json";
        const level   = SEVERITY.INFO;
        const options = { "comment": true };

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/data3.json";
        const level   = SEVERITY.WARN;
        const options = {};

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "file":      file,
                    "linter":    "json-lint",
                    "message":   "Unexpected End Of Array Error. Expecting a" +
                                 " value statement.",
                    "locations": [{ "line": 1, "column": 28 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/data.raw";
        const level   = SEVERITY.FATAL;
        const options = {};

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
