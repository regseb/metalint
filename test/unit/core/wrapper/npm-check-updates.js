/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import NpmCheckUpdatesWrapper from "../../../../src/core/wrapper/npm-check-updates.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/npm-check-updates.js", () => {
    describe("NpmCheckUpdatesWrapper", () => {
        describe("configurable", () => {
            it("should be true", () => {
                assert.ok(NpmCheckUpdatesWrapper.configurable);
            });
        });

        describe("lint()", () => {
            afterEach(async () => {
                await tempFs.reset();
            });

            it("should ignore with OFF level", async () => {
                const root = await tempFs.create({ "package.json": "" });

                const context = {
                    level: Levels.OFF,
                    fix: false,
                    root,
                    files: ["package.json"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "package.json";

                const wrapper = new NpmCheckUpdatesWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notices", async () => {
                const root = await tempFs.create({
                    "package.json":
                        '{ "dependencies": { "metalint": "0.10.0" } }',
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["package.json"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "package.json";

                const wrapper = new NpmCheckUpdatesWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.equal(notices.length, 1);
                assert.equal(notices[0].file, file);
                assert.equal(notices[0].linter, "npm-check-updates");
                assert.ok(
                    notices[0].message.startsWith(
                        "Dependency 'metalint' has a new version ",
                    ),
                    `"${notices[0].message}".startsWith("...")`,
                );
            });

            it("should transmit options", async () => {
                const root = await tempFs.create({
                    "package.json":
                        '{ "dependencies": { "metalint": "0.10.0" } }',
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["package.json"],
                };
                const options = { dep: ["dev"] };
                const file = "package.json";

                const wrapper = new NpmCheckUpdatesWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should ignore error with FATAL level", async () => {
                const root = await tempFs.create({
                    "package.json":
                        '{ "dependencies": { "metalint": "0.10.0" } }',
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root,
                    files: ["package.json"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "package.json";

                const wrapper = new NpmCheckUpdatesWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return FATAL notice", async () => {
                const root = await tempFs.create({
                    "package.json": '<deps><metalint version="0.10.0"></deps>',
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root,
                    files: ["package.json"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "package.json";

                const wrapper = new NpmCheckUpdatesWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "npm-check-updates",
                        severity: Severities.FATAL,
                        message: "Missing or invalid package.json",
                    },
                ]);
            });
        });
    });
});
