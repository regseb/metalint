"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/jsonlint.js");

const DATA_DIR = "../data/lib/wrapper/jsonlint";

describe("lib/wrapper/jsonlint.js", function () {
    it("", function () {
        const file    = DATA_DIR + "/data1.json";
        const options = {};
        const level   = SEVERITY.INFO;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/data2.json";
        const options = {};
        const level   = SEVERITY.WARN;

        return wrapper(file, options, level).then(function (notices) {
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

    it("", function () {
        const file    = DATA_DIR + "/test.txt";
        const options = {};
        const level   = SEVERITY.FATAL;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
