/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import CSVFormatter from "../../../../src/core/formatter/csv.js";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import WriteString from "../../../utils/writestring.js";

describe("src/core/formatter/csv.js", function () {
    describe("CSVFormatter", function () {
        it("should ignore undefined notices", async function () {
            const writer = new WriteString();

            const formatter = new CSVFormatter(Levels.FATAL, { writer });
            await formatter.notify("Foo.java", undefined);
            await formatter.finalize();

            assert.equal(
                writer.toString(),
                "file,line,column,message,linter,rule\r\n",
            );
        });

        it("should ignore empty notice", async function () {
            const writer = new WriteString();

            const formatter = new CSVFormatter(Levels.ERROR, { writer });
            await formatter.notify("foo.sh", []);
            await formatter.finalize();

            assert.equal(
                writer.toString(),
                "file,line,column,message,linter,rule\r\n",
            );
        });

        it("should ignore low level", async function () {
            const writer = new WriteString();

            const formatter = new CSVFormatter(Levels.ERROR, { writer });
            await formatter.notify("foo.php", [
                {
                    file: "foo.php",
                    linter: "phplint",
                    rule: undefined,
                    severity: Severities.WARN,
                    message: "Attention !",
                    locations: [],
                },
                {
                    file: "foo.php",
                    linter: "phplint",
                    rule: undefined,
                    severity: Severities.ERROR,
                    message: "Erreur !!!",
                    locations: [],
                },
            ]);
            await formatter.finalize();

            assert.equal(
                writer.toString(),
                "file,line,column,message,linter,rule\r\n" +
                    '"foo.php",,,"Erreur !!!",phplint,\r\n',
            );
        });

        it("should support notices", async function () {
            const writer = new WriteString();

            const formatter = new CSVFormatter(Levels.INFO, { writer });
            await formatter.notify("foo.py", [
                {
                    file: "foo.py",
                    linter: "pylint",
                    rule: undefined,
                    severity: Severities.ERROR,
                    message: "Un fanfaron, amateur de la chasse,",
                    locations: [],
                },
            ]);
            await formatter.notify("bar.xhtml", [
                {
                    file: "bar.xhtml",
                    linter: "xmllint",
                    rule: "1",
                    severity: Severities.WARN,
                    message: "Venant de perdre un chien de bonne race",
                    locations: [{ line: 1, column: 2 }],
                },
                {
                    file: "bar.xhtml",
                    linter: "htmllint",
                    rule: "2",
                    severity: Severities.INFO,
                    message: "Qu'il soupçonnait dans le corps d'un Lion,",
                    locations: [{ line: 3 }],
                },
            ]);
            await formatter.finalize();

            assert.equal(
                writer.toString(),
                "file,line,column,message,linter,rule\r\n" +
                    '"foo.py",,,"Un fanfaron, amateur de la chasse,",' +
                    "pylint,\r\n" +
                    '"bar.xhtml",1,2,"Venant de perdre un chien de bonne' +
                    ' race",xmllint,"1"\r\n' +
                    '"bar.xhtml",3,,"Qu\'il soupçonnait dans le corps d\'un' +
                    ' Lion,",htmllint,"2"\r\n',
            );
        });

        it("should support quote", async function () {
            const writer = new WriteString();

            const formatter = new CSVFormatter(Levels.INFO, { writer });
            await formatter.notify('foo"bar.svg', [
                {
                    file: 'foo"bar.svg',
                    linter: "svglint",
                    rule: 'prefer-"',
                    severity: Severities.ERROR,
                    message: "Use \" instead of '.",
                    locations: [],
                },
            ]);
            await formatter.finalize();

            assert.equal(
                writer.toString(),
                "file,line,column,message,linter,rule\r\n" +
                    '"foo""bar.svg",,,"Use "" instead of \'.",svglint,' +
                    '"prefer-"""\r\n',
            );
        });
    });
});
