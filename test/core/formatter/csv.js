import assert from "node:assert/strict";
import WriteString from "../../tools/writestring.js";
import SEVERITY from "../../../src/core/severity.js";
import { Formatter } from "../../../src/core/formatter/csv.js";

describe("src/core/formatter/csv.js", function () {
    describe("Formatter", function () {
        it("should support undefined notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.FATAL, writer);
            await reporter.notify("Foo.java", undefined);
            await reporter.finalize();

            assert.equal(writer.toString(),
                         "file,line,column,message,linter,rule\r\n");
        });

        it("should support empty notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.ERROR, writer);
            await reporter.notify("foo.sh", []);
            await reporter.finalize();

            assert.equal(writer.toString(),
                         "file,line,column,message,linter,rule\r\n");
        });

        it("should support notices", async function () {
            const writer = new WriteString();

            const reporter = new Formatter(SEVERITY.INFO, writer);
            await reporter.notify("foo.py", [
                {
                    file:      "foo.py",
                    linter:    "pylint",
                    rule:      undefined,
                    severity:  SEVERITY.ERROR,
                    message:   "Un fanfaron, amateur de la chasse,",
                    locations: [],
                },
            ]);
            await reporter.notify("bar.xhtml", [
                {
                    file:      "bar.xhtml",
                    linter:    "xmllint",
                    rule:      "1",
                    severity:  SEVERITY.WARN,
                    message:   "Venant de perdre un chien de bonne race",
                    locations: [{ line: 1, column: 2 }],
                }, {
                    file:      "bar.xhtml",
                    linter:    "htmllint",
                    rule:      "2",
                    severity:  SEVERITY.INFO,
                    message:   "Qu'il soupçonnait dans le corps d'un Lion,",
                    locations: [{ line: 3 }],
                },
            ]);
            await reporter.finalize();

            assert.equal(writer.toString(),
                "file,line,column,message,linter,rule\r\n" +
                `"foo.py",,,"Un fanfaron, amateur de la chasse,",pylint,\r\n` +
                `"bar.xhtml",1,2,"Venant de perdre un chien de bonne race",` +
                                                             `xmllint,"1"\r\n` +
                `"bar.xhtml",3,,"Qu'il soupçonnait dans le corps d'un Lion,",` +
                                                            `htmllint,"2"\r\n`);
        });
    });
});
