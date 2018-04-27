"use strict";

const assert   = require("assert");
const streams  = require("memory-streams");
const SEVERITY = require("../../../lib/severity");
const Reporter = require("../../data/reporter/french");

describe("test/data/reporter/french.js", function () {
    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Reporter(writer, 0);
        reporter.notify("script.js", null);
        const severity = reporter.finalize();

        assert.strictEqual(severity, null);
        assert.strictEqual(writer.toString(), "");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Reporter(writer, 0);
        reporter.notify("stylelint.json", []);
        const severity = reporter.finalize();

        assert.strictEqual(severity, null);
        assert.strictEqual(writer.toString(), "");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Reporter(writer, 0);
        reporter.notify("un.html", [
            {
                "linter":    "htmlhint",
                "rule":      null,
                "severity":  SEVERITY.ERROR,
                "message":   "Doctype must be declared first.",
                "locations": []
            }
        ]);
        reporter.notify("deux.md", [
            {
                "linter":    "markdownlint",
                "rule":      "MD012",
                "severity":  SEVERITY.WARN,
                "message":   "Multiple consecutive blank lines",
                "locations": []
            }, {
                "linter":    "markdownlint",
                "rule":      "MD010",
                "severity":  SEVERITY.INFO,
                "message":   "Hard tabs",
                "locations": [{ "line": 3 }]
            }
        ]);
        const severity = reporter.finalize();

        assert.strictEqual(severity, SEVERITY.ERROR);
        assert.strictEqual(writer.toString(),
            "Le linter htmlhint a trouvé un problème dans le fichier" +
            " un.html : Doctype must be declared first.\n" +
            "Le linter markdownlint a trouvé que la règle MD012 n’est pas" +
            " respectée dans le fichier deux.md : Multiple consecutive blank" +
            " lines\n" +
            "Le linter markdownlint a trouvé que la règle MD010 n’est pas" +
            " respectée à la ligne 3 du fichier deux.md : Hard tabs\n");
    });
});
