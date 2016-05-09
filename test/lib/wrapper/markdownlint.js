"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/markdownlint.js");

describe("lib/wrapper/markdownlint.js", function () {
    it("", function () {
        const source =
            "# Titre\n" +
            "\n" +
            "Description.\n";
        const options = {};
        const level = SEVERITY.INFO;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const source = "# YYYEEEAAAHHH !\n";
        const options = {};
        const level = SEVERITY.WARN;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "markdownlint",
                    "rule":      "MD026",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Trailing punctuation in header",
                    "locations": [{ "line": 1 }]
                }
            ]);
        });
    });

    it("", function () {
        const source = "*#*\n";
        const options = {};
        const level = SEVERITY.FATAL;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
