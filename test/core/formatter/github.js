/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import { Formatter } from "../../../src/core/formatter/github.js";
import SEVERITY from "../../../src/core/severity.js";
import WriteString from "../../tools/writestring.js";

describe("src/core/formatter/github.js", function () {
    describe("Formatter", function () {
        it("should support undefined notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.FATAL, writer);
            await reporter.notify("foo.md", undefined);
            await reporter.finalize();

            assert.equal(await writer.toString(), "");
        });

        it("should support empty notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.WARN, writer);
            await reporter.notify("foo.html", []);
            await reporter.finalize();

            assert.equal(writer.toString(), "");
        });

        it("should support notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.INFO, writer);
            await reporter.notify("foo.html", [
                {
                    file: "foo.html",
                    linter: "htmllint",
                    severity: SEVERITY.ERROR,
                    message: "La cigale ayant chanté",
                    locations: [],
                },
            ]);
            await reporter.notify("bar.js", [
                {
                    file: "bar.js",
                    linter: "jslint",
                    rule: "1",
                    severity: SEVERITY.WARN,
                    message: "Tout l'été,",
                    locations: [{ line: 1, column: 2 }],
                },
                {
                    file: "bar.js",
                    linter: "jslint",
                    rule: "2",
                    severity: SEVERITY.INFO,
                    message: "Se trouva fort dépourvue",
                    locations: [{ line: 3 }],
                },
            ]);
            await reporter.notify("baz.md", [
                {
                    file: "baz.md",
                    linter: "markdownlint",
                    rule: "line-length",
                    severity: SEVERITY.FATAL,
                    message: "Quand la bise fut venue.",
                    locations: [{ line: 4, column: 5, endColumn: 6 }],
                },
                {
                    file: "bar.md",
                    linter: "markdownlint",
                    rule: "hr-style",
                    severity: SEVERITY.ERROR,
                    message: "Pas un seul petit morceau",
                    locations: [
                        {
                            line: 7,
                            column: 8,
                            endLine: 9,
                            endColumn: 10,
                        },
                    ],
                },
            ]);
            await reporter.finalize();

            assert.equal(
                writer.toString(),
                "::error file=foo.html::La cigale ayant chanté (htmllint)\n" +
                    "::warning file=bar.js,line=1,col=2::Tout l'été," +
                    " (jslint.1)\n" +
                    "::notice file=bar.js,line=3::Se trouva fort dépourvue" +
                    " (jslint.2)\n" +
                    "::error file=baz.md,line=4,col=5,endColumn=6::Quand la" +
                    " bise fut venue. (markdownlint.line-length)\n" +
                    "::error file=baz.md,line=7,col=8,endLine=9,endColumn=10" +
                    "::Pas un seul petit morceau (markdownlint.hr-style)\n",
            );
        });

        it("should ignore error with FATAL level", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.FATAL, writer);
            await reporter.notify("foo.css", [
                {
                    file: "foo.css",
                    linter: "csslint",
                    rule: "3",
                    severity: SEVERITY.ERROR,
                    message: "Quand la bise fut venue.",
                    locations: [],
                },
            ]);
            await reporter.finalize();

            assert.equal(writer.toString(), "");
        });
    });
});
