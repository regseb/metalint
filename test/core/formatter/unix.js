import assert from "node:assert";
import WriteString from "../../tools/writestring.js";
import SEVERITY from "../../../src/core/severity.js";
import { Formatter } from "../../../src/core/formatter/unix.js";

describe("src/core/formatter/unix.js", function () {
    describe("Formatter", function () {
        it("should support null notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.FATAL, writer);
            await reporter.notify("foo.md", null);
            await reporter.finalize();

            assert.strictEqual(await writer.toString(), "");
        });

        it("should support empty notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.WARN, writer);
            await reporter.notify("foo.html", []);
            await reporter.finalize();

            assert.strictEqual(writer.toString(), "");
        });

        it("should support notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.INFO, writer);
            await reporter.notify("foo.html", [
                {
                    file:      "foo.html",
                    linter:    "htmllint",
                    rule:      null,
                    severity:  SEVERITY.ERROR,
                    message:   "La cigale ayant chanté",
                    locations: [],
                },
            ]);
            await reporter.notify("bar.js", [
                {
                    file:      "bar.js",
                    linter:    "jslint",
                    rule:      "1",
                    severity:  SEVERITY.WARN,
                    message:   "Tout l'été,",
                    locations: [{ line: 1, column: 2 }],
                }, {
                    file:      "bar.js",
                    linter:    "jslint",
                    rule:      "2",
                    severity:  SEVERITY.INFO,
                    message:   "Se trouva fort dépourvue",
                    locations: [{ line: 3 }],
                },
            ]);
            await reporter.finalize();

            assert.strictEqual(writer.toString(),
                "foo.html::: La cigale ayant chanté (htmllint)\n" +
                "\n" +
                "bar.js:1:2: Tout l'été, (jslint.1)\n" +
                "bar.js:3:: Se trouva fort dépourvue (jslint.2)\n");
        });

        it("should ignore error with FATAL level", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.FATAL, writer);
            await reporter.notify("foo.css", [
                {
                    file:      "foo.css",
                    linter:    "csslint",
                    rule:      "3",
                    severity:  SEVERITY.ERROR,
                    message:   "Quand la bise fut venue.",
                    locations: [],
                },
            ]);
            await reporter.finalize();

            assert.strictEqual(writer.toString(), "");
        });
    });
});
