"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/htmlhint.js");

describe("lib/wrapper/htmlhint.js", function () {
    it("", function () {
        const source =
            "<!DOCTYPE html>\n" +
            "<title>Exemple</title>\n";
        const options = null;
        const level = SEVERITY.INFO;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const source = "<title>Exemple</title>\n";
        const options = {};
        const level = SEVERITY.WARN;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "htmlhint",
                    "rule":      "doctype-first",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Doctype must be declared first.",
                    "locations": [{ "line": 1, "column": 1 }]
                }
            ]);
        });
    });

    it("", function () {
        const source =
            "<head>\n" +
            "  <script type=\"text/javascript\" src=\"test.js\"></script>\n" +
            "</head>\n";
        const options = { "head-script-disabled": true };
        const level = SEVERITY.ERROR;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const source =
            "\\documentclass{article}\n" +
            "\\begin{document}\n" +
            "Je suis en \\LaTeX !\n" +
            "\\end{document}\n";
        const options = {};
        const level = SEVERITY.FATAL;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
