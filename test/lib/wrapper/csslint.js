/* global require, describe, it */

"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/csslint.js");

describe("lib/wrapper/csslint.js", function () {
    it("", function () {
        const source = "";
        const options = { "zero-units": 2 };
        const level = SEVERITY.INFO;

        return wrapper(source, options, level).then(function (notices) {
            // FIXME Décommenter quand CSSLint gèrera correctement les fichiers
            //       vide. (https://github.com/CSSLint/parser-lib/pull/183)
            // assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const source = "aside { float: right; }";
        const options = { "floats": true };
        const level = SEVERITY.INFO;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const source = "a { }";
        const options = { "empty-rules": true };
        const level = SEVERITY.WARN;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "csslint",
                    "rule":      "empty-rules",
                    "severity":  SEVERITY.WARN,
                    "message":   "Rule is empty.",
                    "locations": [{ "line": 1, "column": 1 }]
                }
            ]);
        });
    });

    it("", function () {
        const source =
            "#aside {\n" +
            "    background-color: #ff9800 !important;\n" +
            "}\n";
        const options = { "ids": 2, "important": 1 };
        const level = SEVERITY.ERROR;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "csslint",
                    "rule":      "ids",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Don't use IDs in selectors.",
                    "locations": [{ "line": 1, "column": 1 }]
                }
            ]);
        });
    });

    it("", function () {
        const source =
            "button {\n" +
            "    border: 0px;\n" +
            "}\n";
        const options = { "zero-units": 2 };
        const level = SEVERITY.FATAL;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
