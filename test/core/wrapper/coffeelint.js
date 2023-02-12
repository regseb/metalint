/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/coffeelint.js";

describe("src/core/wrapper/coffeelint.js", function () {
    describe("wrapper()", function () {
        it("should ignore with FATAL level", async function () {
            const file = "";
            const options = undefined;
            const level = SEVERITY.FATAL;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, []);
        });

        it("should use default options", async function () {
            mock({ "foo.coffee": "bar = true || false" });

            const file = "foo.coffee";
            const options = undefined;
            const level = SEVERITY.INFO;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, []);
        });

        it("should return notices", async function () {
            // eslint-disable-next-line no-tabs
            mock({ "foo.coffee": "bar =\n	true || false" });

            const file = "foo.coffee";
            const options = {
                /* eslint-disable camelcase */
                no_tabs: { level: "error" },
                prefer_english_operator: { level: "warn" },
                /* eslint-enable camelcase */
            };
            const level = SEVERITY.WARN;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, [
                {
                    file,
                    linter: "coffeelint",
                    rule: "prefer_english_operator",
                    severity: SEVERITY.WARN,
                    message: "Don't use &&, ||, ==, !=, or !",
                    locations: [{ line: 2 }],
                },
                {
                    file,
                    linter: "coffeelint",
                    rule: "no_tabs",
                    severity: SEVERITY.ERROR,
                    message: "Line contains tab indentation",
                    locations: [{ line: 2 }],
                },
            ]);
        });

        it("should ignore warning with ERROR level", async function () {
            mock({ "foo.coffee": "bar = true || false" });

            const file = "foo.coffee";
            // eslint-disable-next-line camelcase
            const options = { prefer_english_operator: { level: "warn" } };
            const level = SEVERITY.ERROR;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, []);
        });
    });
});
