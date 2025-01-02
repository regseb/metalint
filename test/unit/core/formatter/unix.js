/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import UnixFormatter from "../../../../src/core/formatter/unix.js";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import WriteString from "../../../utils/write-string.js";

describe("src/core/formatter/unix.js", () => {
    describe("UnixFormatter", () => {
        it("should ignore undefined notices", async () => {
            const writer = new WriteString();

            const formatter = new UnixFormatter(Levels.FATAL, { writer });
            await formatter.notify("foo.md", undefined);
            await formatter.finalize();

            assert.equal(writer.toString(), "");
        });

        it("should ignore empty notice", async () => {
            const writer = new WriteString();

            const formatter = new UnixFormatter(Levels.WARN, { writer });
            await formatter.notify("foo.html", []);
            await formatter.finalize();

            assert.equal(writer.toString(), "");
        });

        it("should ignore low level", async () => {
            const writer = new WriteString();

            const formatter = new UnixFormatter(Levels.WARN, { writer });
            await formatter.notify("foo.css", [
                {
                    file: "foo.css",
                    linter: "stylelint",
                    rule: undefined,
                    severity: Severities.WARN,
                    message: "Bar.",
                    locations: [],
                },
                {
                    file: "foo.css",
                    linter: "stylelint",
                    rule: undefined,
                    severity: Severities.INFO,
                    message: "Baz.",
                    locations: [],
                },
            ]);
            await formatter.finalize();

            assert.equal(writer.toString(), "foo.css::: Bar. (stylelint)\n");
        });

        it("should ignore when all low level of file", async () => {
            const writer = new WriteString();

            const formatter = new UnixFormatter(Levels.ERROR, { writer });
            await formatter.notify("foo.yml", [
                {
                    file: "foo.yml",
                    linter: "yaml-lint",
                    rule: undefined,
                    severity: Severities.ERROR,
                    message: "Bar.",
                    locations: [],
                },
            ]);
            await formatter.notify("baz.json", [
                {
                    file: "baz.json",
                    linter: "prantlf__jsonlint",
                    rule: undefined,
                    severity: Severities.WARN,
                    message: "Qux.",
                    locations: [],
                },
            ]);
            await formatter.finalize();

            assert.equal(writer.toString(), "foo.yml::: Bar. (yaml-lint)\n");
        });

        it("should support notices", async () => {
            const writer = new WriteString();

            const formatter = new UnixFormatter(Levels.INFO, { writer });
            await formatter.notify("foo.md", [
                {
                    file: "foo.md",
                    linter: "markdownlint",
                    rule: undefined,
                    severity: Severities.ERROR,
                    message: "La cigale ayant chanté",
                    locations: [],
                },
            ]);
            await formatter.notify("bar.less", [
                {
                    file: "bar.less",
                    linter: "stylelint",
                    rule: "1",
                    severity: Severities.WARN,
                    message: "Tout l'été,",
                    locations: [{ line: 1, column: 2 }],
                },
                {
                    file: "bar.less",
                    linter: "stylelint",
                    rule: "2",
                    severity: Severities.INFO,
                    message: "Se trouva fort dépourvue",
                    locations: [{ line: 3 }],
                },
            ]);
            await formatter.finalize();

            assert.equal(
                writer.toString(),
                "foo.md::: La cigale ayant chanté (markdownlint)\n" +
                    "\n" +
                    "bar.less:1:2: Tout l'été, (stylelint.1)\n" +
                    "bar.less:3:: Se trouva fort dépourvue (stylelint.2)\n",
            );
        });
    });
});
