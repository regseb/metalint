"use strict";

const assert   = require("assert");
const streams  = require("memory-streams");
const SEVERITY = require("../../../lib/severity");
const Reporter = require("../../../lib/reporter/console");

describe("lib/reporter/console.js", function () {
    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Reporter(SEVERITY.WARN, writer, {});
        reporter.notify("README.md",    null);
        reporter.notify("package.json", []);
        reporter.finalize();

        assert.strictEqual(writer.toString(), "");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Reporter(SEVERITY.FATAL, writer,
                                      { "showZeroNotice": true });
        reporter.notify("README.md",    null);
        reporter.notify("package.json", []);
        reporter.finalize();

        assert.strictEqual(writer.toString(), "package.json: 0 notice.\n\n");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Reporter(SEVERITY.INFO, writer,
                                      { "showZeroNotice": true,
                                        "showNoChecked":  true });
        reporter.notify("README.md",    null);
        reporter.notify("package.json", []);
        reporter.finalize();

        assert.strictEqual(writer.toString(),
            "README.md: No checked.\n\n" +
            "package.json: 0 notice.\n\n");
    });
});
