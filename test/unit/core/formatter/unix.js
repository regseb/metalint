/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import UnixFormatter from "../../../../src/core/formatter/unix.js";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import WriteString from "../../../utils/writestring.js";

describe("src/core/formatter/unix.js", function () {
    describe("UnixFormatter", function () {
        it("should ignore undefined notices", async function () {
            const writer = new WriteString();

            const formatter = new UnixFormatter(Levels.FATAL, { writer });
            await formatter.notify("foo.md", undefined);
            await formatter.finalize();

            assert.equal(writer.toString(), "");
        });

        it("should ignore empty notice", async function () {
            const writer = new WriteString();

            const formatter = new UnixFormatter(Levels.WARN, { writer });
            await formatter.notify("foo.html", []);
            await formatter.finalize();

            assert.equal(writer.toString(), "");
        });

        it("should ignore low level", async function () {
            const writer = new WriteString();

            const formatter = new UnixFormatter(Levels.WARN, { writer });
            await formatter.notify("foo.css", [
                {
                    file: "foo.css",
                    linter: "csslint",
                    rule: undefined,
                    severity: Severities.WARN,
                    message: "Bar.",
                    locations: [],
                },
                {
                    file: "foo.css",
                    linter: "csslint",
                    rule: undefined,
                    severity: Severities.INFO,
                    message: "Baz.",
                    locations: [],
                },
            ]);
            await formatter.finalize();

            assert.equal(writer.toString(), "foo.css::: Bar. (csslint)\n");
        });

        it("should ignore when all low level of file", async function () {
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

        it("should support notices", async function () {
            const writer = new WriteString();

            const formatter = new UnixFormatter(Levels.INFO, { writer });
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
            await formatter.finalize();

            assert.equal(
                writer.toString(),
                "foo.html::: La cigale ayant chanté (htmllint)\n" +
                    "\n" +
                    "bar.js:1:2: Tout l'été, (jslint.1)\n" +
                    "bar.js:3:: Se trouva fort dépourvue (jslint.2)\n",
            );
        });
    });
});
