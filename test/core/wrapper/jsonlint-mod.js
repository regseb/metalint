/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/jsonlint-mod.js";

describe("src/core/wrapper/jsonlint-mod.js", function () {
    describe("wrapper()", function () {
        it("should ignore with FATAL level", async function () {
            const file = "";
            const options = undefined;
            const level = SEVERITY.FATAL;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, []);
        });

        it("should return notice", async function () {
            mock({ "foo.json": `{ "foo": 0\n"bar": 1 }` });

            const file = "foo.json";
            const options = undefined;
            const level = SEVERITY.INFO;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, [
                {
                    file,
                    linter: "jsonlint-mod",
                    severity: SEVERITY.ERROR,
                    message: "Expecting 'EOF', '}', ',', ']', got 'STRING'",
                    locations: [{ line: 2 }],
                },
            ]);
        });
    });
});
