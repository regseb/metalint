/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import { describe, it } from "node:test";
import Levels from "../../../../src/core/levels.js";
import Wrapper from "../../../../src/core/wrapper/wrapper.js";

describe("src/core/wrapper/wrapper.js", () => {
    describe("Wrapper", () => {
        describe("get level()", () => {
            it("should return level", () => {
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

        describe("get fix()", () => {
            it("should return false", () => {
                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root: process.cwd(),
                    files: [],
                };

                const wrapper = new Wrapper(context);
                assert.equal(wrapper.fix, false);
            });

            it("should return true", () => {
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

        describe("get root()", () => {
            it("should return root", () => {
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

        describe("get files()", () => {
            it("should return files", () => {
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

        describe("lint()", () => {
            it("should return no notice", async () => {
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
