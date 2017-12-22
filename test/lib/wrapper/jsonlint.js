"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const linter   = require("../../../lib/wrapper/jsonlint.js");

const DATA_DIR = "../data/lib/wrapper/jsonlint";

describe("lib/wrapper/jsonlint.js", function () {
    it("configure()", function () {
        const checker = linter.configure();
        assert.deepStrictEqual(checker, {
            "patterns": "**/*.json",
            "linters":  { "jsonlint": null }
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/data1.json";
        const options = null;
        const level   = SEVERITY.INFO;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "jsonlint",
                    "rule":      null,
                    "severity":  SEVERITY.ERROR,
                    "message":   "Expecting 'EOF', '}', ',', ']', got" +
                                 " 'STRING'",
                    "locations": [{ "line": 3 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/data2.json";
        const options = {};
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
                    "linter":    "jsonlint",
                    "rule":      null,
                    "severity":  SEVERITY.ERROR,
                    "message":   "Expecting 'STRING', 'NUMBER', 'NULL'," +
                                 " 'TRUE', 'FALSE', '{', '[', got 'undefined'",
                    "locations": [{ "line": 2 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/test.txt";
        const options = {};
        const level   = SEVERITY.FATAL;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
