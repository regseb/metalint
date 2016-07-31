"use strict";

const streams  = require("memory-streams");
const assert   = require("assert");
const colors   = require("colors");
const reporter = require("../../../lib/reporter/console.js");

describe("lib/reporter/console.js", function () {
    it("", function () {
        const promise = Promise.resolve({
            "README.md":    null,
            "package.json": []
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 0).then(function (severity) {
            assert.strictEqual(severity, null);
            assert.strictEqual(writer.toString(), "");
        });
    });

    it("", function () {
        const promise = Promise.resolve({
            "README.md":    null,
            "package.json": []
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 3).then(function (severity) {
            assert.strictEqual(severity, null);
            assert.strictEqual(writer.toString(),
                               colors.bold("package.json: 0 notice.") + "\n\n");
        });
    });

    it("", function () {
        const promise = Promise.resolve({
            "README.md":    null,
            "package.json": []
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 4).then(function (severity) {
            assert.strictEqual(severity, null);
            assert.strictEqual(writer.toString(),
                colors.bold("README.md: No checked.") + "\n\n" +
                colors.bold("package.json: 0 notice.") + "\n\n");
        });
    });
});
