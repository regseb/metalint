/* global require, describe, it */

"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/jsonlint.js");

describe("lib/wrapper/jsonlint.js", function () {
    it("", function () {
        const source = "{ \"min\": 0, \"max\": 365 }\n";
        const options = {};
        const level = SEVERITY.INFO;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const source = "{ \"min\": 0, \"max\": Infinity }\n";
        const options = {};
        const level = SEVERITY.WARN;

        return wrapper(source, options, level).then(function (notices) {
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
        const source = "Hello world !\n";
        const options = {};
        const level = SEVERITY.FATAL;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
