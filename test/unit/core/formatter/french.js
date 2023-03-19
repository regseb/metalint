/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import FrenchFormatter from "../../../data/french.js";
import WriteString from "../../../utils/writestring.js";

describe("test/data/french.js", function () {
    describe("FrenchFormatter", function () {
        it("should support undefined notices", async function () {
            const writer = new WriteString();

            const formatter = new FrenchFormatter(Levels.WARN, { writer });
            await formatter.notify("script.js", undefined);
            await formatter.finalize();

            assert.equal(writer.toString(), "");
        });

        it("should support empty notices", async function () {
            const writer = new WriteString();

            const formatter = new FrenchFormatter(Levels.ERROR, { writer });
            await formatter.notify("stylelint.json", []);
            await formatter.finalize();

            assert.equal(writer.toString(), "");
        });

        it("should support notices", async function () {
            const writer = new WriteString();

            const formatter = new FrenchFormatter(Levels.INFO, { writer });
            await formatter.notify("foo.html", [
                {
                    file: "foo.html",
                    linter: "htmlhint",
                    rule: undefined,
                    severity: Severities.ERROR,
                    message: "Doctype must be declared first.",
                    locations: [],
                },
            ]);
            await formatter.notify("bar.md", [
                {
                    file: "bar.md",
                    linter: "markdownlint",
                    rule: "MD012",
                    severity: Severities.WARN,
                    message: "Multiple consecutive blank lines",
                    locations: [],
                },
                {
                    file: "bar.md",
                    linter: "markdownlint",
                    rule: "MD010",
                    severity: Severities.INFO,
                    message: "Hard tabs",
                    locations: [{ line: 3 }],
                },
            ]);
            await formatter.finalize();

            assert.equal(
                writer.toString(),
                "Le linter htmlhint a trouvé un problème dans le fichier" +
                    " foo.html : Doctype must be declared first.\n" +
                    "Le linter markdownlint a trouvé que la règle MD012 n'est" +
                    " pas respectée dans le fichier bar.md : Multiple" +
                    " consecutive blank lines\n" +
                    "Le linter markdownlint a trouvé que la règle MD010 n'est" +
                    " pas respectée à la ligne 3 du fichier bar.md : Hard" +
                    " tabs\n",
            );
        });
    });
});
