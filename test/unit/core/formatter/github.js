/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import GitHubFormatter from "../../../../src/core/formatter/github.js";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import WriteString from "../../../utils/write-string.js";

describe("src/core/formatter/github.js", () => {
    describe("GitHubFormatter", () => {
        it("should ignore undefined notices", async () => {
            const writer = new WriteString();

            const formatter = new GitHubFormatter(Levels.FATAL, { writer });
            await formatter.notify("foo.md", undefined);
            await formatter.finalize();

            assert.equal(writer.toString(), "");
        });

        it("should ignore empty notice", async () => {
            const writer = new WriteString();

            const formatter = new GitHubFormatter(Levels.WARN, { writer });
            await formatter.notify("foo.html", []);
            await formatter.finalize();

            assert.equal(writer.toString(), "");
        });

        it("should ignore low level", async () => {
            const writer = new WriteString();

            const formatter = new GitHubFormatter(Levels.FATAL, { writer });
            await formatter.notify("foo.css", [
                {
                    file: "foo.css",
                    linter: "csslint",
                    rule: undefined,
                    severity: Severities.ERROR,
                    message: "Bar.",
                    locations: [],
                },
                {
                    file: "foo.css",
                    linter: "csslint",
                    rule: undefined,
                    severity: Severities.FATAL,
                    message: "Baz.",
                    locations: [],
                },
            ]);
            await formatter.finalize();

            assert.equal(
                writer.toString(),
                "::error file=foo.css::Baz. (csslint)\n",
            );
        });

        it("should support notices", async () => {
            const writer = new WriteString();

            const formatter = new GitHubFormatter(Levels.INFO, { writer });
            await formatter.notify("foo.html", [
                {
                    file: "foo.html",
                    linter: "htmllint",
                    rule: undefined,
                    severity: Severities.ERROR,
                    message: "La cigale ayant chanté",
                    locations: [],
                },
            ]);
            await formatter.notify("bar.js", [
                {
                    file: "bar.js",
                    linter: "jslint",
                    rule: "1",
                    severity: Severities.WARN,
                    message: "Tout l'été,",
                    locations: [{ line: 1, column: 2 }],
                },
                {
                    file: "bar.js",
                    linter: "jslint",
                    rule: "2",
                    severity: Severities.INFO,
                    message: "Se trouva fort dépourvue",
                    locations: [{ line: 3 }],
                },
            ]);
            await formatter.notify("baz.md", [
                {
                    file: "baz.md",
                    linter: "markdownlint",
                    rule: "line-length",
                    severity: Severities.FATAL,
                    message: "Quand la bise fut venue.",
                    locations: [{ line: 4, column: 5, endColumn: 6 }],
                },
                {
                    file: "bar.md",
                    linter: "markdownlint",
                    rule: "hr-style",
                    severity: Severities.ERROR,
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
            await formatter.finalize();

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
    });
});
