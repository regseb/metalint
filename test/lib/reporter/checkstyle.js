"use strict";

const streams  = require("memory-streams");
const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const reporter = require("../../../lib/reporter/checkstyle.js");

describe("lib/reporter/checkstyle.js", function () {
    it("", function () {
        const promise = Promise.resolve({
            "un.json": null
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 0).then(function (severity) {
            assert.equal(null, severity);
            assert.equal(
                "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                "<checkstyle version=\"6.8\">" +
                "</checkstyle>\n",
                writer.toString());
        });
    });

    it("", function () {
        const promise = Promise.resolve({
            "un.md": []
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 1).then(function (severity) {
            assert.equal(null, severity);
            assert.equal(
                "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                "<checkstyle version=\"6.8\">\n" +
                "  <file name=\"un.md\">\n" +
                "  </file>\n" +
                "</checkstyle>\n",
                writer.toString());
        });
    });

    it("", function () {
        const promise = Promise.resolve({
            "un.html": [
                {
                    "linter":    "htmllint",
                    "rule":      null,
                    "severity":  SEVERITY.ERROR,
                    "message":   "Une Grenouille vit un Bœuf,",
                    "locations": []
                }
            ],
            "deux.js": [
                {
                    "linter":    "jslint",
                    "rule":      "1",
                    "severity":  SEVERITY.WARN,
                    "message":   "Qui lui sembla de belle taille.",
                    "locations": [{ "line": 1, "column": 2 }]
                }, {
                    "linter":    "jslint",
                    "rule":      "2",
                    "severity":  SEVERITY.FATAL,
                    "message":   "Elle qui n'était pas grosse en tout comme" +
                                 " un œuf,",
                    "locations": [{ "line": 3 }]
                }, {
                    "linter":    "jslint",
                    "rule":      "3",
                    "severity":  SEVERITY.INFO,
                    "message":   "Envieuse s'étend, et s'enfle et se" +
                                 " travaille,",
                    "locations": [{ "line": 4 }, { "line": 5 }]
                }
            ]
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 2).then(function (severity) {
            assert.equal(SEVERITY.FATAL, severity);
            assert.equal(
                "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                "<checkstyle version=\"6.8\">\n" +
                "  <file name=\"un.html\">\n" +
                "    <error severity=\"error\"" +
                          " message=\"Une Grenouille vit un Bœuf,\"" +
                          " source=\"htmllint\" />\n" +
                "  </file>\n" +
                "  <file name=\"deux.js\">\n" +
                "    <error line=\"1\" column=\"2\" severity=\"warning\"" +
                          " message=\"Qui lui sembla de belle taille.\"" +
                          " source=\"jslint.1\" />\n" +
                "    <error line=\"3\" severity=\"error\"" +
                          " message=\"Elle qui n&apos;était pas grosse en" +
                                   " tout comme un œuf,\"" +
                          " source=\"jslint.2\" />\n" +
                "    <error line=\"4\" severity=\"info\"" +
                          " message=\"Envieuse s&apos;étend, et s&apos;enfle" +
                                   " et se travaille,\"" +
                          " source=\"jslint.3\" />\n" +
                "  </file>\n" +
                "</checkstyle>\n",
                writer.toString());
        });
    });
});
