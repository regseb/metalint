/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { wrap } from "../../../../src/core/utils/array.js";

describe("src/core/utils/array.js", () => {
    describe("wrap()", () => {
        it("should return value if it's an array", () => {
            const array = wrap(["foo", "bar"]);
            assert.deepEqual(array, ["foo", "bar"]);
        });

        it("should return an array of value if it isn't an array", () => {
            const array = wrap("foo");
            assert.deepEqual(array, ["foo"]);
        });
    });
});
