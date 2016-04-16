/* global Promise, require, describe, it */

"use strict";

const streams  = require("memory-streams");
const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const reporter = require("../../../lib/reporter/none.js");

describe("lib/reporter/none.js", function () {
    it("", function () {
        const promise = Promise.resolve({
            "README.md": null
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 0).then(function (severity) {
            assert.strictEqual(severity, null);
            assert.strictEqual(writer.toString(), "");
        });
    });

    it("", function () {
        const promise = Promise.resolve({
            "server.js": []
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 0).then(function (severity) {
            assert.strictEqual(severity, null);
            assert.strictEqual(writer.toString(), "");
        });
    });

    it("", function () {
        const promise = Promise.resolve({
            "un.js": [
                {
                    "linter":    "jslint",
                    "rule":      null,
                    "severity":  SEVERITY.ERROR,
                    "message":   "La Mort ne surprend point le sage :",
                    "locations": []
                }, {
                    "linter":    "jslint",
                    "rule":      "1",
                    "severity":  SEVERITY.WARN,
                    "message":   "Il est toujours prêt à partir,",
                    "locations": [{ "line": 1 }]
                }
            ]
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 0).then(function (severity) {
            assert.strictEqual(severity, SEVERITY.ERROR);
            assert.strictEqual(writer.toString(), "");
        });
    });
});
