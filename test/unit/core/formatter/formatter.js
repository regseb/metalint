/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import Formatter from "../../../../src/core/formatter/formatter.js";
import Levels from "../../../../src/core/levels.js";

describe("src/core/formatter/formatter.js", function () {
    describe("Formatter", function () {
        describe("get level()", function () {
            it("should return level", function () {
                const formatter = new Formatter(Levels.WARN);
                assert.equal(formatter.level, Levels.WARN);
            });
        });

        describe("notify()", function () {
            it("should return undefined", function () {
                const formatter = new Formatter(Levels.ERROR);
                // Ne pas utiliser "await" car si la méthode ne retourne pas une
                // promesse : le "await" transférera la valeur sans indiquer que
                // ce n'était pas une promesse.
                const result = formatter.notify("foo", undefined);
                assert.deepEqual(result, Promise.resolve(undefined));
            });
        });

        describe("finalize()", function () {
            it("should return undefined", function () {
                const formatter = new Formatter(Levels.ERROR);
                // Ne pas utiliser "await" car si la méthode ne retourne pas une
                // promesse : le "await" transférera la valeur sans indiquer que
                // ce n'était pas une promesse.
                const result = formatter.finalize();
                assert.deepEqual(result, Promise.resolve(undefined));
            });
        });
    });
});
