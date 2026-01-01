/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { merge } from "../../../../src/core/utils/object.js";

describe("src/core/utils/object.js", () => {
    describe("merge()", () => {
        it("should return object if first is equal second", () => {
            const obj = { foo: "bar" };
            const merged = merge(obj, obj);
            assert.equal(merged, obj);
        });

        it("should return second if first isn't an object", () => {
            const merged = merge("foo", { bar: "baz" });
            assert.deepEqual(merged, { bar: "baz" });
        });

        it("should return second if first is an array", () => {
            const merged = merge(["foo", "bar"], { baz: "qux" });
            assert.deepEqual(merged, { baz: "qux" });
        });

        it("should return second if first is undefined", () => {
            const merged = merge(undefined, { foo: "bar" });
            assert.deepEqual(merged, { foo: "bar" });
        });

        it("should return second if second isn't an object", () => {
            const merged = merge({ foo: "bar" }, "baz");
            assert.equal(merged, "baz");
        });

        it("should return second if second is an array", () => {
            const merged = merge({ foo: "bar" }, ["baz", "qux"]);
            assert.deepEqual(merged, ["baz", "qux"]);
        });

        it("should return second if second is undefined", () => {
            const merged = merge({ foo: "bar" }, undefined);
            assert.deepEqual(merged, undefined);
        });

        it("should return second if property is only on second", () => {
            const merged = merge({}, { foo: "bar" });
            assert.deepEqual(merged, { foo: "bar" });
        });

        it("should return first if property is only on first", () => {
            const merged = merge({ foo: "bar" }, {});
            assert.deepEqual(merged, { foo: "bar" });
        });

        it("should return second if property is on first and second", () => {
            const merged = merge({ foo: "bar" }, { foo: "baz" });
            assert.deepEqual(merged, { foo: "baz" });
        });
    });
});
