"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/html5-lint.js");

const DATA_DIR = "../data/lib/wrapper/html5-lint";

describe("lib/wrapper/html5-lint.js", function () {
    it("", function () {
        const file    = DATA_DIR + "/index1.html";
        const options = { "service": "https://validator.w3.org/nu/" };
        const level   = SEVERITY.INFO;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/index2.html";
        const options = { "service": "https://validator.w3.org/nu/" };
        const level   = SEVERITY.ERROR;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "html5-lint",
                    "rule":      null,
                    "severity":  SEVERITY.ERROR,
                    "message":   "Start tag seen without seeing a doctype" +
                                 " first. Expected e.g. “<!DOCTYPE html>”.",
                    "locations": [{ "line": 1, "column": 7 }]
                }
            ]);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/index3.html";
        const options = { "service": "https://validator.undefined" };
        const level   = SEVERITY.ERROR;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "html5-lint",
                    "rule":      null,
                    "severity":  SEVERITY.FATAL,
                    "message":   "getaddrinfo ENOTFOUND validator.undefined" +
                                 " validator.undefined:443",
                    "locations": []
                }
            ]);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/index.tex";
        const options = {};
        const level   = SEVERITY.OFF;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
