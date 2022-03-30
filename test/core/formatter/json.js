import assert from "node:assert";
import WriteString from "../../tools/writestring.js";
import SEVERITY from "../../../src/core/severity.js";
import { Formatter } from "../../../src/core/formatter/json.js";

describe("src/core/formatter/json.js", function () {
    describe("Formatter", function () {
        it("should support null notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.WARN, writer, {});
            await reporter.notify("foo.html", null);
            await reporter.finalize();

            assert.strictEqual(writer.toString(), `{"foo.html":null}\n`);
        });

        it("should support empty notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.INFO, writer, {
                indent: 0,
            });
            await reporter.notify("foo.js", []);
            await reporter.finalize();

            assert.strictEqual(writer.toString(), `{"foo.js":[]}\n`);
        });

        it("should support notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.ERROR, writer, {
                indent: 2,
            });
            await reporter.notify("foo.js", [
                {
                    file:      "foo.js",
                    linter:    "eslint",
                    rule:      "complexity",
                    severity:  SEVERITY.WARN,
                    message:   "Method 'eval' has a complexity of 666.",
                    locations: [{ line: 1, column: 4 }],
                }, {
                    file:      "foo.js",
                    linter:    "eslint",
                    rule:      "no-unused-vars",
                    severity:  SEVERITY.ERROR,
                    message:   "'superflous' is defined but never used",
                    locations: [{ line: 2, column: 7 }],
                },
            ]);
            await reporter.finalize();

            assert.strictEqual(writer.toString(),
                "{\n" +
                `  "foo.js": [\n` +
                "    {\n" +
                `      "file": "foo.js",\n` +
                `      "linter": "eslint",\n` +
                `      "rule": "no-unused-vars",\n` +
                `      "severity": 2,\n` +
                `      "message": "'superflous' is defined but never used",\n` +
                `      "locations": [\n` +
                "        {\n" +
                `          "line": 2,\n` +
                `          "column": 7\n` +
                "        }\n" +
                "      ]\n" +
                "    }\n" +
                "  ]\n" +
                "}\n");
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

            assert.strictEqual(writer.toString(), `{"foo.md":[]}\n`);
        });
    });
});
