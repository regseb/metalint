/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import JSONFormatter from "../../../../src/core/formatter/json.js";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import WriteString from "../../../utils/writestring.js";

describe("src/core/formatter/json.js", function () {
    describe("JSONFormatter", function () {
        it("should support undefined notices", async function () {
            const writer = new WriteString();

            const formatter = new JSONFormatter(Levels.WARN, { writer });
            await formatter.notify("foo.html", undefined);
            await formatter.finalize();

            assert.equal(writer.toString(), '{"foo.html":null}\n');
        });

        it("should support empty notices", async function () {
            const writer = new WriteString();

            const formatter = new JSONFormatter(Levels.INFO, {
                writer,
                indent: 0,
            });
            await formatter.notify("foo.js", []);
            await formatter.finalize();

            assert.equal(writer.toString(), '{"foo.js":[]}\n');
        });

        it("should support notices", async function () {
            const writer = new WriteString();

            const formatter = new JSONFormatter(Levels.ERROR, {
                writer,
                indent: 2,
            });
            await formatter.notify("foo.js", [
                {
                    file: "foo.js",
                    linter: "eslint",
                    rule: "complexity",
                    severity: Severities.WARN,
                    message: "Method 'eval' has a complexity of 666.",
                    locations: [{ line: 1, column: 4 }],
                },
                {
                    file: "foo.js",
                    linter: "eslint",
                    rule: "no-unused-vars",
                    severity: Severities.ERROR,
                    message: "'superfluous' is defined but never used",
                    locations: [{ line: 2, column: 7 }],
                },
            ]);
            await formatter.finalize();

            assert.equal(
                writer.toString(),
                "{\n" +
                    '  "foo.js": [\n' +
                    "    {\n" +
                    '      "file": "foo.js",\n' +
                    '      "linter": "eslint",\n' +
                    '      "rule": "no-unused-vars",\n' +
                    '      "severity": 2,\n' +
                    '      "message": "\'superfluous\' is defined but never' +
                    ' used",\n' +
                    '      "locations": [\n' +
                    "        {\n" +
                    '          "line": 2,\n' +
                    '          "column": 7\n' +
                    "        }\n" +
                    "      ]\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}\n",
            );
        });

        it("should ignore error with FATAL level", async function () {
            const writer = new WriteString();

            const formatter = new JSONFormatter(Levels.FATAL, { writer });
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

            assert.equal(writer.toString(), '{"foo.md":[]}\n');
        });
    });
});
