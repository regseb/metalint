import assert from "node:assert";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/yaml-lint.js";

describe("src/core/wrapper/yaml-lint.js", function () {
    describe("wrapper()", function () {
        it("should ignore with FATAL level", async function () {
            const file    = "";
            const level   = SEVERITY.FATAL;
            const options = null;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
        });

        it("should use default options", async function () {
            mock({ "foo.yaml": "foo - bar" });

            const file    = "foo.yaml";
            const level   = SEVERITY.ERROR;
            const options = null;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
        });

        it("should return notices", async function () {
            mock({ "foo.yml": ": bar" });

            const file    = "foo.yml";
            const level   = SEVERITY.INFO;
            const options = { schema: "FAILSAFE_SCHEMA" };

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, [
                {
                    file,
                    linter:    "yaml-lint",
                    rule:      null,
                    severity:  SEVERITY.ERROR,
                    message:   "incomplete explicit mapping pair; a key node" +
                               " is missed; or followed by a non-tabulated" +
                               " empty line",
                    locations: [{ line: 1, column: 1 }],
                },
            ]);
        });
    });
});
