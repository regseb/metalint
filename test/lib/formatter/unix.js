"use strict";

const assert    = require("assert");
const streams   = require("memory-streams");
const SEVERITY  = require("../../../lib/severity");
const Formatter = require("../../../lib/formatter/unix");

describe("lib/formatter/unix.js", function () {
    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Formatter(SEVERITY.FATAL, writer);
        reporter.notify("script.js", null);
        reporter.finalize();

        assert.strictEqual(writer.toString(), "");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Formatter(SEVERITY.WARN, writer);
        reporter.notify("stylelint.json", []);
        reporter.finalize();

        assert.strictEqual(writer.toString(), "");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Formatter(SEVERITY.INFO, writer);
        reporter.notify("un.html", [
            {
                linter:    "htmllint",
                rule:      null,
                severity:  SEVERITY.ERROR,
                message:   "La cigale ayant chanté",
                locations: [],
            },
        ]);
        reporter.notify("deux.js", [
            {
                linter:    "jslint",
                rule:      "1",
                severity:  SEVERITY.WARN,
                message:   "Tout l'été,",
                locations: [{ line: 1, column: 2 }],
            }, {
                linter:    "jslint",
                rule:      "2",
                severity:  SEVERITY.INFO,
                message:   "Se trouva fort dépourvue",
                locations: [{ line: 3 }],
            },
        ]);
        reporter.finalize();

        assert.strictEqual(writer.toString(),
            "un.html::: La cigale ayant chanté (htmllint)\n" +
            "\n" +
            "deux.js:1:2: Tout l'été, (jslint.1)\n" +
            "deux.js:3:: Se trouva fort dépourvue (jslint.2)\n");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Formatter(SEVERITY.ERROR, writer);
        reporter.notify("un.css", [
            {
                linter:    "csslint",
                rule:      "3",
                severity:  SEVERITY.FATAL,
                message:   "Quand la bise fut venue.",
                locations: [],
            },
        ]);
        reporter.finalize();

        assert.strictEqual(writer.toString(),
            "un.css::: Quand la bise fut venue. (csslint.3)\n");
    });
});
