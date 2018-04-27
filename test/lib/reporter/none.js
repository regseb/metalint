"use strict";

const assert   = require("assert");
const streams  = require("memory-streams");
const SEVERITY = require("../../../lib/severity");
const Reporter = require("../../../lib/reporter/none");

describe("lib/reporter/none.js", function () {
    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Reporter(writer, 0);
        reporter.notify("README.md", null);
        const severity = reporter.finalize();

        assert.strictEqual(severity, null);
        assert.strictEqual(writer.toString(), "");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Reporter(writer, 0);
        reporter.notify("server.js", []);
        const severity = reporter.finalize();

        assert.strictEqual(severity, null);
        assert.strictEqual(writer.toString(), "");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Reporter(writer, 10);
        reporter.notify("un.js", [
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
        ]);
        const severity = reporter.finalize();

        assert.strictEqual(severity, SEVERITY.ERROR);
        assert.strictEqual(writer.toString(), "");
    });
});
