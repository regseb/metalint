/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import Levels from "../../../../src/core/levels.js";
import Wrapper from "../../../../src/core/wrapper/wrapper.js";

describe("src/core/wrapper/wrapper.js", function () {
    describe("Wrapper", function () {
        describe("get level()", function () {
            it("should return level", function () {
                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: [],
                };

                const wrapper = new Wrapper(context);
                assert.equal(wrapper.level, Levels.FATAL);
            });
        });

        describe("get fix()", function () {
            it("should return false", function () {
                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root: process.cwd(),
                    files: [],
                };

                const wrapper = new Wrapper(context);
                assert.equal(wrapper.fix, false);
            });

            it("should return true", function () {
                const context = {
                    level: Levels.ERROR,
                    fix: true,
                    root: process.cwd(),
                    files: [],
                };

                const wrapper = new Wrapper(context);
                assert.equal(wrapper.fix, true);
            });
        });

        describe("get root()", function () {
            it("should return root", function () {
                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: "foo",
                    files: [],
                };

                const wrapper = new Wrapper(context);
                assert.equal(wrapper.root, "foo");
            });
        });

        describe("get files()", function () {
            it("should return files", function () {
                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo", "bar"],
                };

                const wrapper = new Wrapper(context);
                assert.deepEqual(wrapper.files, ["foo", "bar"]);
            });
        });

        describe("lint()", function () {
            it("should return no notice", async function () {
                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo"],
                };

                const wrapper = new Wrapper(context);
                const notices = await wrapper.lint("foo");
                assert.deepEqual(notices, []);
            });
        });
    });
});
