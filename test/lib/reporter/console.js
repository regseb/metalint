"use strict";

const assert   = require("assert");
const streams  = require("memory-streams");
const Reporter = require("../../../lib/reporter/console");

describe("lib/reporter/console.js", function () {
    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Reporter(writer, 0);
        reporter.notify("README.md",    null);
        reporter.notify("package.json", []);
        const severity = reporter.finalize();

        assert.strictEqual(severity, null);
        assert.strictEqual(writer.toString(), "");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Reporter(writer, 3);
        reporter.notify("README.md",    null);
        reporter.notify("package.json", []);
        const severity = reporter.finalize();

        assert.strictEqual(severity, null);
        assert.strictEqual(writer.toString(), "package.json: 0 notice.\n\n");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Reporter(writer, 4);
        reporter.notify("README.md",    null);
        reporter.notify("package.json", []);
        const severity = reporter.finalize();

        assert.strictEqual(severity, null);
        assert.strictEqual(writer.toString(),
            "README.md: No checked.\n\n" +
            "package.json: 0 notice.\n\n");
    });
});
