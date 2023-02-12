/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import { Formatter } from "../../../src/core/formatter/checkstyle.js";
import SEVERITY from "../../../src/core/severity.js";
import WriteString from "../../tools/writestring.js";

describe("src/core/formatter/checkstyle.js", function () {
    describe("Formatter", function () {
        it("should support undefined notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.INFO, writer, {});
            await reporter.notify("foo.json", undefined);
            await reporter.finalize();

            assert.equal(
                writer.toString(),
                `<?xml version="1.0" encoding="UTF-8"?>` +
                    `<checkstyle version="8.28"></checkstyle>\n`,
            );
        });

        it("should support empty notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.ERROR, writer, {
                indent: 0,
            });
            await reporter.notify("foo.md", []);
            await reporter.finalize();

            assert.equal(
                writer.toString(),
                `<?xml version="1.0" encoding="UTF-8"?>\n` +
                    `<checkstyle version="8.28">\n` +
                    `<file name="foo.md">\n` +
                    "</file>\n" +
                    "</checkstyle>\n",
            );
        });

        it("should support notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.INFO, writer, {
                indent: 2,
            });
            await reporter.notify("foo.html", [
                {
                    file: "foo.html",
                    linter: "htmllint",
                    severity: SEVERITY.ERROR,
                    message: "Une Grenouille vit un Bœuf,",
                    locations: [],
                },
            ]);
            await reporter.notify("bar.js", [
                {
                    file: "bar.js",
                    linter: "jslint",
                    rule: "1",
                    severity: SEVERITY.WARN,
                    message: "Qui lui sembla de belle taille.",
                    locations: [{ line: 1, column: 2 }],
                },
                {
                    file: "bar.js",
                    linter: "jslint",
                    rule: "2",
                    severity: SEVERITY.FATAL,
                    message:
                        "Elle qui n'était pas grosse en tout comme un œuf,",
                    locations: [{ line: 3 }],
                },
                {
                    file: "bar.js",
                    linter: "jslint",
                    rule: "3",
                    severity: SEVERITY.INFO,
                    message: "Envieuse s'étend, et s'enfle et se travaille,",
                    locations: [{ line: 4 }, { line: 5 }],
                },
            ]);
            await reporter.finalize();

            assert.equal(
                writer.toString(),
                `<?xml version="1.0" encoding="UTF-8"?>\n` +
                    `<checkstyle version="8.28">\n` +
                    `  <file name="foo.html">\n` +
                    `    <error severity="error"` +
                    ` message="Une Grenouille vit un Bœuf,"` +
                    ` source="htmllint" />\n` +
                    "  </file>\n" +
                    `  <file name="bar.js">\n` +
                    `    <error line="1" column="2" severity="warning"` +
                    ` message="Qui lui sembla de belle taille."` +
                    ` source="jslint.1" />\n` +
                    `    <error line="3" severity="error"` +
                    ` message="Elle qui n&apos;était pas grosse en` +
                    ` tout comme un œuf,"` +
                    ` source="jslint.2" />\n` +
                    `    <error line="4" severity="info"` +
                    ` message="Envieuse s&apos;étend, et` +
                    ` s&apos;enfle et se travaille,"` +
                    ` source="jslint.3" />\n` +
                    "  </file>\n" +
                    "</checkstyle>\n",
            );
        });
    });
});
