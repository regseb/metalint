import assert from "assert";
import streams from "memory-streams";
import { SEVERITY } from "../../../lib/severity.js";
import { Formatter } from "../../../lib/formatter/console.js";

describe("lib/formatter/console.js", function () {
    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Formatter(SEVERITY.WARN, writer, {});
        reporter.notify("README.md",    null);
        reporter.notify("package.json", []);

        assert.strictEqual(writer.toString(), "");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Formatter(SEVERITY.FATAL, writer, {
            showZeroNotice: true,
        });
        reporter.notify("README.md",    null);
        reporter.notify("package.json", []);

        assert.strictEqual(writer.toString(), "package.json: 0 notice.\n\n");
    });

    it("", function () {
        const writer = new streams.WritableStream();

        const reporter = new Formatter(SEVERITY.INFO, writer, {
            showZeroNotice: true,
            showNoChecked:  true,
        });
        reporter.notify("README.md",    null);
        reporter.notify("package.json", []);

        assert.strictEqual(writer.toString(),
            "README.md: No checked.\n\n" +
            "package.json: 0 notice.\n\n");
    });
});
