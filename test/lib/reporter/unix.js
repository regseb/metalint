"use strict";

const streams  = require("memory-streams");
const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const reporter = require("../../../lib/reporter/unix.js");

describe("lib/reporter/unix.js", function () {
    it("", function () {
        const promise = Promise.resolve({
            "script.js": null
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 0).then(function (severity) {
            assert.strictEqual(severity, null);
            assert.strictEqual(writer.toString(), "");
        });
    });

    it("", function () {
        const promise = Promise.resolve({
            "csslint.json": []
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 0).then(function (severity) {
            assert.strictEqual(severity, null);
            assert.strictEqual(writer.toString(), "");
        });
    });

    it("", function () {
        const promise = Promise.resolve({
            "un.html": [
                {
                    "linter":    "htmllint",
                    "rule":      null,
                    "severity":  SEVERITY.ERROR,
                    "message":   "La cigale ayant chanté",
                    "locations": []
                }
            ],
            "deux.js": [
                {
                    "linter":    "jslint",
                    "rule":      "1",
                    "severity":  SEVERITY.WARN,
                    "message":   "Tout l’été,",
                    "locations": [{ "line": 1, "column": 2 }]
                }, {
                    "linter":    "jslint",
                    "rule":      "2",
                    "severity":  SEVERITY.INFO,
                    "message":   "Se trouva fort dépourvue",
                    "locations": [{ "line": 3 }]
                }
            ]
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 2).then(function (severity) {
            assert.strictEqual(severity, SEVERITY.ERROR);
            assert.strictEqual(writer.toString(),
                "un.html::: La cigale ayant chanté (htmllint)\n" +
                "\n" +
                "deux.js:1:2: Tout l’été, (jslint.1)\n" +
                "deux.js:3:: Se trouva fort dépourvue (jslint.2)\n");
        });
    });

    it("", function () {
        const promise = Promise.resolve({
            "un.css": [
                {
                    "linter":    "csslint",
                    "rule":      "3",
                    "severity":  SEVERITY.FATAL,
                    "message":   "Quand la bise fut venue.",
                    "locations": []
                }
            ]
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 0).then(function (severity) {
            assert.strictEqual(severity, SEVERITY.FATAL);
            assert.strictEqual(writer.toString(),
                "un.css::: Quand la bise fut venue.\n");
        });
    });
});
