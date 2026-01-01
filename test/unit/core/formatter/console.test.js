/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import { afterEach, describe, it } from "node:test";
import ConsoleFormatter from "../../../../src/core/formatter/console.js";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import tempFs from "../../../utils/temp-fs.js";
import WriteString from "../../../utils/write-string.js";

// Enlever la variable FORCE_COLOR, car elle est ajoutée par le test runner de
// Node et elle corrompt la méthode styleText().
// https://github.com/nodejs/node/issues/57921
process.env.FORCE_COLOR = undefined;

describe("src/core/formatter/console.js", () => {
    describe("ConsoleFormatter", () => {
        afterEach(async () => {
            await tempFs.reset();
        });

        it("should support undefined notices", async () => {
            const writer = new WriteString();

            const formatter = new ConsoleFormatter(Levels.WARN, { writer });
            await formatter.notify("foo.md", undefined);
            await formatter.finalize();

            assert.equal(writer.toString(), "");
        });

        it("should print file with undefined notices", async () => {
            const writer = new WriteString();

            const formatter = new ConsoleFormatter(Levels.FATAL, {
                writer,
                showNoChecked: true,
            });
            await formatter.notify("foo.js", undefined);
            await formatter.finalize();

            assert.equal(writer.toString(), "foo.js: No checked.\n\n");
        });

        it("should support empty notices", async () => {
            const writer = new WriteString();

            const formatter = new ConsoleFormatter(Levels.WARN, { writer });
            await formatter.notify("foo.json", []);
            await formatter.finalize();

            assert.equal(writer.toString(), "");
        });

        it("should print file with empty notices", async () => {
            const writer = new WriteString();

            const formatter = new ConsoleFormatter(Levels.INFO, {
                writer,
                showZeroNotice: true,
            });
            await formatter.notify("foo.css", []);
            await formatter.finalize();

            assert.equal(writer.toString(), "foo.css: 0 notice.\n\n");
        });

        it("should support notices", async () => {
            await tempFs.create({ "foo.js": "var foo = 0;" });

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

        it("should ignore error with FATAL level", async () => {
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
