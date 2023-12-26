/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { exists } from "../../../../src/core/utils/file.js";

describe("src/core/utils/file.js", function () {
    describe("exists()", function () {
        it("should return true when file exists", async function () {
            // Tester avec le répertoire où est ce test.
            const path = fileURLToPath(import.meta.resolve("./"));
            const exist = await exists(path);
            assert.equal(exist, true);
        });

        it("should return false when file doesn't exist", async function () {
            const path = fileURLToPath(import.meta.resolve("./foo"));
            const exist = await exists(path);
            assert.equal(exist, false);
        });
    });
});
