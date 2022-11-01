import assert from "node:assert/strict";
import WriteString from "../../tools/writestring.js";
import { Formatter } from "../../data/french.js";
import SEVERITY from "../../../src/core/severity.js";

describe("test/data/french.js", function () {
    describe("Formatter", function () {
        it("should support undefined notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.WARN, writer);
            await reporter.notify("script.js", undefined);
            await reporter.finalize();

            assert.equal(writer.toString(), "");
        });

        it("should support empty notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.ERROR, writer);
            await reporter.notify("stylelint.json", []);
            await reporter.finalize();

            assert.equal(writer.toString(), "");
        });

        it("should support notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.INFO, writer);
            await reporter.notify("foo.html", [
                {
                    file:      "foo.html",
                    linter:    "htmlhint",
                    severity:  SEVERITY.ERROR,
                    message:   "Doctype must be declared first.",
                    locations: [],
                },
            ]);
            await reporter.notify("bar.md", [
                {
                    file:      "bar.md",
                    linter:    "markdownlint",
                    rule:      "MD012",
                    severity:  SEVERITY.WARN,
                    message:   "Multiple consecutive blank lines",
                    locations: [],
                }, {
                    file:      "bar.md",
                    linter:    "markdownlint",
                    rule:      "MD010",
                    severity:  SEVERITY.INFO,
                    message:   "Hard tabs",
                    locations: [{ line: 3 }],
                },
            ]);
            await reporter.finalize();

            assert.equal(writer.toString(),
                "Le linter htmlhint a trouvé un problème dans le fichier" +
                " foo.html : Doctype must be declared first.\n" +
                "Le linter markdownlint a trouvé que la règle MD012 n'est pas" +
                " respectée dans le fichier bar.md : Multiple consecutive" +
                " blank lines\n" +
                "Le linter markdownlint a trouvé que la règle MD010 n'est pas" +
                " respectée à la ligne 3 du fichier bar.md : Hard tabs\n");
        });
    });
});
