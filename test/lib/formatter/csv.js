"use strict";

const assert    = require("assert");
const streams   = require("memory-streams");
const SEVERITY  = require("../../../lib/severity");
const Formatter = require("../../../lib/formatter/csv");

describe("lib/formatter/csv.js", function () {
    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Formatter(SEVERITY.FATAL, writer);
        reporter.notify("Main.java", null);
        reporter.finalize();

        assert.strictEqual(writer.toString(),
            "file,line,column,message,linter,rule\r\n");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Formatter(SEVERITY.ERROR, writer);
        reporter.notify("todo.sh", []);
        reporter.finalize();

        assert.strictEqual(writer.toString(),
            "file,line,column,message,linter,rule\r\n");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Formatter(SEVERITY.INFO, writer);
        reporter.notify("un.py", [
            {
                "linter":    "pylint",
                "rule":      null,
                "severity":  SEVERITY.ERROR,
                "message":   "Un fanfaron, amateur de la chasse,",
                "locations": []
            }
        ]);
        reporter.notify("deux.xhtml", [
            {
                "linter":    "xmllint",
                "rule":      "1",
                "severity":  SEVERITY.WARN,
                "message":   "Venant de perdre un chien de bonne race",
                "locations": [{ "line": 1, "column": 2 }]
            }, {
                "linter":    "htmllint",
                "rule":      "2",
                "severity":  SEVERITY.INFO,
                "message":   "Qu'il soupçonnait dans le corps d'un Lion,",
                "locations": [{ "line": 3 }]
            }
        ]);
        reporter.finalize();

        assert.strictEqual(writer.toString(),
            "file,line,column,message,linter,rule\r\n" +
            `"un.py",,,"Un fanfaron, amateur de la chasse,",pylint,\r\n` +
            `"deux.xhtml",1,2,"Venant de perdre un chien de bonne race",` +
                                                             `xmllint,"1"\r\n` +
            `"deux.xhtml",3,,"Qu'il soupçonnait dans le corps d'un Lion,",` +
                                                            `htmllint,"2"\r\n`);
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Formatter(SEVERITY.INFO, writer);
        reporter.notify("un.css", [
            {
                "linter":    "csslint",
                "rule":      "3",
                "severity":  SEVERITY.WARN,
                "message":   "Vit un berger. « Enseigne-moi, de grâce,",
                "locations": []
            }, {
                "linter":    "csslint",
                "rule":      null,
                "severity":  SEVERITY.INFO,
                "message":   "De mon voleur, lui dit-il, la maison,",
                "locations": []
            }
        ]);
        reporter.finalize();

        assert.strictEqual(writer.toString(),
            "file,line,column,message,linter,rule\r\n" +
            `"un.css",,,"Vit un berger. « Enseigne-moi, de grâce,",csslint,` +
                                                                     `"3"\r\n` +
            `"un.css",,,"De mon voleur, lui dit-il, la maison,",csslint,\r\n`);
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Formatter(SEVERITY.INFO, writer);
        reporter.notify("un.yml", [
            {
                "linter":    "ymllint",
                "rule":      null,
                "severity":  SEVERITY.FATAL,
                "message":   "De mon voleur, lui dit-il, la maison,",
                "locations": []
            }
        ]);
        reporter.finalize();

        assert.strictEqual(writer.toString(),
            "file,line,column,message,linter,rule\r\n" +
            `"un.yml",,,"De mon voleur, lui dit-il, la maison,",ymllint,\r\n`);
    });
});
