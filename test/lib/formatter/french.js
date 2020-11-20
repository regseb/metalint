import assert from "assert";
import streams from "memory-streams";
import { SEVERITY } from "../../../lib/severity.js";
import { Formatter } from "../../data/formatter/french.js";

describe("test/data/formatter/french.js", function () {
    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Formatter(SEVERITY.WARN, writer);
        reporter.notify("script.js", null);
        reporter.finalize();

        assert.strictEqual(writer.toString(), "");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Formatter(SEVERITY.ERROR, writer);
        reporter.notify("stylelint.json", []);
        reporter.finalize();

        assert.strictEqual(writer.toString(), "");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Formatter(SEVERITY.INFO, writer);
        reporter.notify("un.html", [
            {
                linter:    "htmlhint",
                rule:      null,
                severity:  SEVERITY.ERROR,
                message:   "Doctype must be declared first.",
                locations: [],
            },
        ]);
        reporter.notify("deux.md", [
            {
                linter:    "markdownlint",
                rule:      "MD012",
                severity:  SEVERITY.WARN,
                message:   "Multiple consecutive blank lines",
                locations: [],
            }, {
                linter:    "markdownlint",
                rule:      "MD010",
                severity:  SEVERITY.INFO,
                message:   "Hard tabs",
                locations: [{ line: 3 }],
            },
        ]);
        reporter.finalize();

        assert.strictEqual(writer.toString(),
            "Le linter htmlhint a trouvé un problème dans le fichier" +
            " un.html : Doctype must be declared first.\n" +
            "Le linter markdownlint a trouvé que la règle MD012 n'est pas" +
            " respectée dans le fichier deux.md : Multiple consecutive blank" +
            " lines\n" +
            "Le linter markdownlint a trouvé que la règle MD010 n'est pas" +
            " respectée à la ligne 3 du fichier deux.md : Hard tabs\n");
    });
});
