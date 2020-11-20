import assert from "assert";
import streams from "memory-streams";
import { SEVERITY } from "../../../lib/severity.js";
import { Formatter } from "../../../lib/formatter/checkstyle.js";

describe("lib/formatter/checkstyle.js", function () {
    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Formatter(SEVERITY.INFO, writer, {});
        reporter.notify("un.json", null);
        reporter.finalize();

        assert.strictEqual(writer.toString(),
            `<?xml version="1.0" encoding="UTF-8"?>` +
            `<checkstyle version="8.28">` +
            "</checkstyle>\n");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Formatter(SEVERITY.INFO, writer, { indent: 0 });
        reporter.notify("un.txt", null);
        reporter.finalize();

        assert.strictEqual(writer.toString(),
            `<?xml version="1.0" encoding="UTF-8"?>\n` +
            `<checkstyle version="8.28">\n` +
            "</checkstyle>\n");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Formatter(SEVERITY.ERROR, writer, { indent: 1 });
        reporter.notify("un.md", []);
        reporter.finalize();

        assert.strictEqual(writer.toString(),
            `<?xml version="1.0" encoding="UTF-8"?>\n` +
            `<checkstyle version="8.28">\n` +
            ` <file name="un.md">\n` +
            " </file>\n" +
            "</checkstyle>\n");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Formatter(SEVERITY.INFO, writer, { indent: 2 });
        reporter.notify("un.html", [
            {
                linter:    "htmllint",
                rule:      null,
                severity:  SEVERITY.ERROR,
                message:   "Une Grenouille vit un Bœuf,",
                locations: [],
            },
        ]);
        reporter.notify("deux.js", [
            {
                linter:    "jslint",
                rule:      "1",
                severity:  SEVERITY.WARN,
                message:   "Qui lui sembla de belle taille.",
                locations: [{ line: 1, column: 2 }],
            }, {
                linter:    "jslint",
                rule:      "2",
                severity:  SEVERITY.FATAL,
                message:   "Elle qui n'était pas grosse en tout comme un œuf,",
                locations: [{ line: 3 }],
            }, {
                linter:    "jslint",
                rule:      "3",
                severity:  SEVERITY.INFO,
                message:   "Envieuse s'étend, et s'enfle et se travaille,",
                locations: [{ line: 4 }, { line: 5 }],
            },
        ]);
        reporter.finalize();

        assert.strictEqual(writer.toString(),
            `<?xml version="1.0" encoding="UTF-8"?>\n` +
            `<checkstyle version="8.28">\n` +
            `  <file name="un.html">\n` +
            `    <error severity="error"` +
                      ` message="Une Grenouille vit un Bœuf,"` +
                      ` source="htmllint" />\n` +
            "  </file>\n" +
            `  <file name="deux.js">\n` +
            `    <error line="1" column="2" severity="warning"` +
                      ` message="Qui lui sembla de belle taille."` +
                      ` source="jslint.1" />\n` +
            `    <error line="3" severity="error"` +
                      ` message="Elle qui n&apos;était pas grosse en tout` +
                               ` comme un œuf,"` +
                      ` source="jslint.2" />\n` +
            `    <error line="4" severity="info"` +
                      ` message="Envieuse s&apos;étend, et s&apos;enfle et se` +
                               ` travaille,"` +
                      ` source="jslint.3" />\n` +
            "  </file>\n" +
            "</checkstyle>\n");
    });
});
