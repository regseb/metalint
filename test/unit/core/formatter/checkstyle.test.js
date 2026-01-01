/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import CheckstyleFormatter from "../../../../src/core/formatter/checkstyle.js";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import WriteString from "../../../utils/write-string.js";

describe("src/core/formatter/checkstyle.js", () => {
    describe("CheckstyleFormatter", () => {
        it("should support undefined notices", async () => {
            const writer = new WriteString();

            const formatter = new CheckstyleFormatter(Levels.INFO, { writer });
            await formatter.notify("foo.json", undefined);
            await formatter.finalize();

            assert.equal(
                writer.toString(),
                '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<checkstyle version="8.28"></checkstyle>\n',
            );
        });

        it("should support empty notices", async () => {
            const writer = new WriteString();

            const formatter = new CheckstyleFormatter(Levels.ERROR, {
                writer,
                indent: 0,
            });
            await formatter.notify("foo.md", []);
            await formatter.finalize();

            assert.equal(
                writer.toString(),
                '<?xml version="1.0" encoding="UTF-8"?>\n' +
                    '<checkstyle version="8.28">\n' +
                    '<file name="foo.md">\n' +
                    "</file>\n" +
                    "</checkstyle>\n",
            );
        });

        it("should ignore low level", async () => {
            const writer = new WriteString();

            const formatter = new CheckstyleFormatter(Levels.ERROR, {
                writer,
                indent: 0,
            });
            await formatter.notify("foo.yml", [
                {
                    file: "foo.yml",
                    linter: "yaml-lint",
                    rule: undefined,
                    severity: Severities.WARN,
                    message: "Bar.",
                    locations: [],
                },
            ]);
            await formatter.finalize();

            assert.equal(
                writer.toString(),
                '<?xml version="1.0" encoding="UTF-8"?>\n' +
                    '<checkstyle version="8.28">\n' +
                    '<file name="foo.yml">\n' +
                    "</file>\n" +
                    "</checkstyle>\n",
            );
        });

        it("should support notices", async () => {
            const writer = new WriteString();

            const formatter = new CheckstyleFormatter(Levels.INFO, {
                writer,
                indent: 2,
            });
            await formatter.notify("foo.html", [
                {
                    file: "foo.html",
                    linter: "htmllint",
                    rule: undefined,
                    severity: Severities.ERROR,
                    message: "Une Grenouille vit un Bœuf,",
                    locations: [],
                },
            ]);
            await formatter.notify("bar.js", [
                {
                    file: "bar.js",
                    linter: "jslint",
                    rule: "1",
                    severity: Severities.WARN,
                    message: "Qui lui sembla de belle taille.",
                    locations: [{ line: 1, column: 2 }],
                },
                {
                    file: "bar.js",
                    linter: "jslint",
                    rule: "2",
                    severity: Severities.FATAL,
                    message:
                        "Elle qui n'était pas grosse en tout comme un œuf,",
                    locations: [{ line: 3 }],
                },
                {
                    file: "bar.js",
                    linter: "jslint",
                    rule: "3",
                    severity: Severities.INFO,
                    message: "Envieuse s'étend, et s'enfle et se travaille,",
                    locations: [{ line: 4 }, { line: 5 }],
                },
            ]);
            await formatter.finalize();

            assert.equal(
                writer.toString(),
                '<?xml version="1.0" encoding="UTF-8"?>\n' +
                    '<checkstyle version="8.28">\n' +
                    '  <file name="foo.html">\n' +
                    '    <error severity="error"' +
                    ' message="Une Grenouille vit un Bœuf,"' +
                    ' source="htmllint" />\n' +
                    "  </file>\n" +
                    '  <file name="bar.js">\n' +
                    '    <error line="1" column="2" severity="warning"' +
                    ' message="Qui lui sembla de belle taille."' +
                    ' source="jslint.1" />\n' +
                    '    <error line="3" severity="error"' +
                    ' message="Elle qui n&apos;était pas grosse en' +
                    ' tout comme un œuf,"' +
                    ' source="jslint.2" />\n' +
                    '    <error line="4" severity="info"' +
                    ' message="Envieuse s&apos;étend, et' +
                    ' s&apos;enfle et se travaille,"' +
                    ' source="jslint.3" />\n' +
                    "  </file>\n" +
                    "</checkstyle>\n",
            );
        });

        it("should support specials characters", async () => {
            const writer = new WriteString();

            const formatter = new CheckstyleFormatter(Levels.WARN, {
                writer,
                indent: 0,
            });
            await formatter.notify("<", [
                {
                    file: "<",
                    linter: ">",
                    rule: "&",
                    severity: Severities.WARN,
                    message: '"',
                    locations: [],
                },
            ]);
            await formatter.finalize();

            assert.equal(
                writer.toString(),
                '<?xml version="1.0" encoding="UTF-8"?>\n' +
                    '<checkstyle version="8.28">\n' +
                    '<file name="&lt;">\n' +
                    '<error severity="warning"' +
                    ' message="&quot;"' +
                    ' source="&gt;.&amp;" />\n' +
                    "</file>\n" +
                    "</checkstyle>\n",
            );
        });
    });
});
