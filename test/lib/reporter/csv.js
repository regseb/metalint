/* global Promise, require, describe, it */

"use strict";

const streams  = require("memory-streams");
const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const reporter = require("../../../lib/reporter/csv.js");

describe("lib/reporter/csv.js", function () {
    it("", function () {
        const promise = Promise.resolve({
            "Main.java": null
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 0).then(function (severity) {
            assert.strictEqual(severity, null);
            assert.strictEqual(writer.toString(),
                               "file,line,column,message\r\n");
        });
    });

    it("", function () {
        const promise = Promise.resolve({
            "todo.sh": []
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 0).then(function (severity) {
            assert.strictEqual(severity, null);
            assert.strictEqual(writer.toString(),
                               "file,line,column,message\r\n");
        });
    });

    it("", function () {
        const promise = Promise.resolve({
            "un.py": [
                {
                    "linter":    "pylint",
                    "rule":      null,
                    "severity":  SEVERITY.ERROR,
                    "message":   "Un fanfaron, amateur de la chasse,",
                    "locations": []
                }
            ],
            "deux.xhtml": [
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
            ]
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 1).then(function (severity) {
            assert.strictEqual(severity, SEVERITY.ERROR);
            assert.strictEqual(writer.toString(),
                "file,line,column,message,linter\r\n" +
                "\"un.py\",,,\"Un fanfaron, amateur de la chasse,\"" +
                    ",pylint\r\n" +
                "\"deux.xhtml\",1,2,\"Venant de perdre un chien de bonne" +
                                   " race\",xmllint\r\n" +
                "\"deux.xhtml\",3,,\"Qu'il soupçonnait dans le corps d'un" +
                                   " Lion,\",htmllint\r\n");
        });
    });

    it("", function () {
        const promise = Promise.resolve({
            "un.css": [
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
            ]
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 2).then(function (severity) {
            assert.strictEqual(severity, SEVERITY.WARN);
            assert.strictEqual(writer.toString(),
                "file,line,column,message,linter,rule\r\n" +
                "\"un.css\",,,\"Vit un berger. « Enseigne-moi, de grâce,\"," +
                    "csslint,\"3\"\r\n" +
                "\"un.css\",,,\"De mon voleur, lui dit-il, la maison,\"," +
                    "csslint,\r\n");
        });
    });

    it("", function () {
        const promise = Promise.resolve({
            "un.yml": [
                {
                    "linter":    "ymllint",
                    "rule":      null,
                    "severity":  SEVERITY.FATAL,
                    "message":   "De mon voleur, lui dit-il, la maison,",
                    "locations": []
                }
            ]
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 0).then(function (severity) {
            assert.strictEqual(severity, SEVERITY.FATAL);
            assert.strictEqual(writer.toString(),
                "file,line,column,message\r\n" +
                "\"un.yml\",,,\"De mon voleur, lui dit-il, la maison,\"\r\n");
        });
    });
});
