/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import Formatter from "../../../../src/core/formatter/formatter.js";
import Levels from "../../../../src/core/levels.js";

describe("src/core/formatter/formatter.js", () => {
    describe("Formatter", () => {
        describe("get level()", () => {
            it("should return level", () => {
                const formatter = new Formatter(Levels.WARN);
                assert.equal(formatter.level, Levels.WARN);
            });
        });

        describe("notify()", () => {
            it("should return undefined", async () => {
                const formatter = new Formatter(Levels.ERROR);
                // Ne pas utiliser "await" car si la méthode ne retourne pas une
                // promesse : le "await" transférera la valeur sans indiquer que
                // ce n'était pas une promesse.
                const result = formatter.notify("foo", undefined);
                assert.ok(result instanceof Promise);
                assert.deepEqual(await result, undefined);
                // Ne pas comparer directement les promesses, car la comparaison
                // est boguée. https://github.com/nodejs/node/issues/55198
                // assert.deepEqual(result, Promise.resolve(undefined));
            });
        });

        describe("finalize()", () => {
            it("should return undefined", async () => {
                const formatter = new Formatter(Levels.ERROR);
                // Ne pas utiliser "await" car si la méthode ne retourne pas une
                // promesse : le "await" transférera la valeur sans indiquer que
                // ce n'était pas une promesse.
                const result = formatter.finalize();
                assert.ok(result instanceof Promise);
                assert.deepEqual(await result, undefined);
                // Ne pas comparer directement les promesses, car la comparaison
                // est boguée. https://github.com/nodejs/node/issues/55198
                // assert.deepEqual(result, Promise.resolve(undefined));
            });
        });
    });
});
