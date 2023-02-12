/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/yaml-lint.js";

describe("src/core/wrapper/yaml-lint.js", function () {
    describe("wrapper()", function () {
        it("should ignore with FATAL level", async function () {
            const file = "";
            const options = undefined;
            const level = SEVERITY.FATAL;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, []);
        });

        it("should use default options", async function () {
            mock({ "foo.yaml": "foo - bar" });

            const file = "foo.yaml";
            const options = undefined;
            const level = SEVERITY.ERROR;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, []);
        });

        it("should return notices", async function () {
            mock({ "foo.yml": ": bar" });

            const file = "foo.yml";
            const options = { schema: "FAILSAFE_SCHEMA" };
            const level = SEVERITY.INFO;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, [
                {
                    file,
                    linter: "yaml-lint",
                    severity: SEVERITY.ERROR,
                    message:
                        "incomplete explicit mapping pair; a key node is" +
                        " missed; or followed by a non-tabulated empty line",
                    locations: [{ line: 1, column: 1 }],
                },
            ]);
        });
    });
});
