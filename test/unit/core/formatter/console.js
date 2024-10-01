/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import ConsoleFormatter from "../../../../src/core/formatter/console.js";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import createTempFileSystem from "../../../utils/fake.js";
import WriteString from "../../../utils/writestring.js";

describe("src/core/formatter/console.js", function () {
    describe("ConsoleFormatter", function () {
        it("should support undefined notices", async function () {
            const writer = new WriteString();

            const formatter = new ConsoleFormatter(Levels.WARN, { writer });
            await formatter.notify("foo.md", undefined);
            await formatter.finalize();

            assert.equal(writer.toString(), "");
        });

        it("should print file with undefined notices", async function () {
            const writer = new WriteString();

            const formatter = new ConsoleFormatter(Levels.FATAL, {
                writer,
                showNoChecked: true,
            });
            await formatter.notify("foo.js", undefined);
            await formatter.finalize();

            assert.equal(writer.toString(), "foo.js: No checked.\n\n");
        });

        it("should support empty notices", async function () {
            const writer = new WriteString();

            const formatter = new ConsoleFormatter(Levels.WARN, { writer });
            await formatter.notify("foo.json", []);
            await formatter.finalize();

            assert.equal(writer.toString(), "");
        });

        it("should print file with empty notices", async function () {
            const writer = new WriteString();

            const formatter = new ConsoleFormatter(Levels.INFO, {
                writer,
                showZeroNotice: true,
            });
            await formatter.notify("foo.css", []);
            await formatter.finalize();

            assert.equal(writer.toString(), "foo.css: 0 notice.\n\n");
        });

        it("should support notices", async function () {
            await createTempFileSystem({ "foo.js": "var foo = 0;" });

            const writer = new WriteString();

            const formatter = new ConsoleFormatter(Levels.INFO, { writer });
            await formatter.notify("foo.js", [
                {
                    file: "foo.js",
                    linter: "eslint",
                    rule: "no-var",
                    severity: Severities.ERROR,
                    message: "Unexpected var, use let or const instead.",
                    locations: [{ line: 1, column: 1 }],
                },
                {
                    file: "foo.js",
                    linter: "eslint",
                    rule: "no-unused-vars",
                    severity: Severities.WARN,
                    message: "'foo' is defined but never used",
                    locations: [{ line: 1, column: 5 }],
                },
            ]);
            await formatter.finalize();

            assert.equal(
                writer.toString(),
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
                    "\n",
            );
        });

        it("should ignore error with FATAL level", async function () {
            const writer = new WriteString();

            const formatter = new ConsoleFormatter(Levels.FATAL, { writer });
            await formatter.notify("foo.md", [
                {
                    file: "foo.md",
                    linter: "markdownlint",
                    rule: "MD002",
                    severity: Severities.ERROR,
                    message: "First header should be a h1 header.",
                    locations: [{ line: 1 }],
                },
            ]);
            await formatter.finalize();

            assert.equal(writer.toString(), "");
        });
    });
});
