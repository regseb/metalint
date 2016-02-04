/* global require, describe, it */

"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/html5-lint.js");

describe("lib/wrapper/html5-lint.js", function () {
    it("", function () {
        const source =
            "<!DOCTYPE html>\n" +
            "<title>Exemple</title>\n";
        const options = {};
        const level = SEVERITY.INFO;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const source =
            "<title>Le titre</title>\n" +
            "<img border=\"0\" src=\"logo.svg\" alt=\"Logo\" />\n";
        const options = {};
        const level = SEVERITY.ERROR;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "html5-lint",
                    "rule":      null,
                    "severity":  SEVERITY.ERROR,
                    "message":   "Start tag seen without seeing a doctype" +
                                 " first. Expected “<!DOCTYPE html>”.",
                    "locations": [{ "line": 1, "column": 7 }]
                }
            ]);
        });
    });

    it("", function () {
        const source =
            "<!DOCTYPE html>\n" +
            "<title>Exemple</title>\n";
        const options = { "service": "https://validator.undefined" };
        const level = SEVERITY.ERROR;

        return wrapper(source, options, level).then(function (notices) {
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
        const source =
            "\\documentclass{article}\n" +
            "\\begin{document}\n" +
            "Je suis en \\LaTeX !\n" +
            "\\end{document}\n";
        const options = {};
        const level = SEVERITY.OFF;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
