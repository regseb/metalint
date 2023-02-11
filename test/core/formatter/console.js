import assert from "node:assert/strict";
import mock from "mock-fs";
import { Formatter } from "../../../src/core/formatter/console.js";
import SEVERITY from "../../../src/core/severity.js";
import WriteString from "../../tools/writestring.js";

describe("src/core/formatter/console.js", function () {
    describe("Formatter", function () {
        it("should support undefined notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.WARN, writer, {});
            await reporter.notify("foo.md", undefined);
            await reporter.finalize();

            assert.equal(writer.toString(), "");
        });

        it("should print file with undefined notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.FATAL, writer, {
                showNoChecked: true,
            });
            await reporter.notify("foo.js", undefined);
            await reporter.finalize();

            assert.equal(writer.toString(), "foo.js: No checked.\n\n");
        });

        it("should support empty notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.WARN, writer, {});
            await reporter.notify("foo.json", []);
            await reporter.finalize();

            assert.equal(writer.toString(), "");
        });

        it("should print file with empty notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.INFO, writer, {
                showZeroNotice: true,
            });
            await reporter.notify("foo.css", []);
            await reporter.finalize();

            assert.equal(writer.toString(), "foo.css: 0 notice.\n\n");
        });

        it("should support notices", async function () {
            mock({ "foo.js": "var foo = 0;" });

            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.INFO, writer, {});
            await reporter.notify("foo.js", [
                {
                    file:      "foo.js",
                    linter:    "eslint",
                    rule:      "no-var",
                    severity:  SEVERITY.ERROR,
                    message:   "Unexpected var, use let or const instead.",
                    locations: [{ line: 1, column: 1 }],
                }, {
                    file:      "foo.js",
                    linter:    "eslint",
                    rule:      "no-unused-vars",
                    severity:  SEVERITY.WARN,
                    message:   "'foo' is defined but never used",
                    locations: [{ line: 1, column: 5 }],
                },
            ]);
            await reporter.finalize();

            assert.equal(writer.toString(),
                "foo.js: 1 error, 1 warning.\n" +
                "ERROR: Unexpected var, use let or const instead." +
                                                          " (eslint.no-var)\n" +
               "    1‖ var foo = 0;\n" +
               "-------^\n" +
               "\n" +
               "WARN : 'foo' is defined but never used" +
                                                  " (eslint.no-unused-vars)\n" +
               "    1‖ var foo = 0;\n" +
               "-----------^\n" +
               "\n");
        });

        it("should ignore error with FATAL level", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.FATAL, writer, {});
            await reporter.notify("foo.md", [
                {
                    file:      "foo.md",
                    linter:    "markdownlint",
                    rule:      "MD002",
                    severity:  SEVERITY.ERROR,
                    message:   "First header should be a h1 header.",
                    locations: [{ line: 1 }],
                },
            ]);
            await reporter.finalize();

            assert.equal(writer.toString(), "");
        });
    });
});
