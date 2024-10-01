/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import { merge } from "../../../../src/core/utils/object.js";

describe("src/core/utils/object.js", function () {
    describe("merge()", function () {
        it("should return second if first isn't an object", function () {
            const merged = merge("foo", { bar: "baz" });
            assert.deepEqual(merged, { bar: "baz" });
        });

        it("should return second if first is an array", function () {
            const merged = merge(["foo", "bar"], { baz: "qux" });
            assert.deepEqual(merged, { baz: "qux" });
        });

        it("should return second if second isn't an object", function () {
            const merged = merge({ foo: "bar" }, "baz");
            assert.equal(merged, "baz");
        });

        it("should return second if second is an array", function () {
            const merged = merge({ foo: "bar" }, ["baz", "qux"]);
            assert.deepEqual(merged, ["baz", "qux"]);
        });

        it("should return second if property is only on second", function () {
            const merged = merge({}, { foo: "bar" });
            assert.deepEqual(merged, { foo: "bar" });
        });

        it("should return first if property is only on first", function () {
            const merged = merge({ foo: "bar" }, {});
            assert.deepEqual(merged, { foo: "bar" });
        });

        it("should return second if property is on first and second", function () {
            const merged = merge({ foo: "bar" }, { foo: "baz" });
            assert.deepEqual(merged, { foo: "baz" });
        });
    });
});
