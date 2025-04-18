/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import { afterEach, describe, it } from "node:test";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import CoffeeLintCliWrapper from "../../../../src/core/wrapper/coffeelint__cli.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/coffeelint__cli.js", () => {
    describe("CoffeeLintCliWrapper", () => {
        describe("configurable", () => {
            it("should be true", () => {
                assert.ok(CoffeeLintCliWrapper.configurable);
            });
        });

        describe("lint()", () => {
            afterEach(async () => {
                await tempFs.reset();
            });

            it("should ignore with FATAL level", async () => {
                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                // Utiliser un fichier qui n'existe pas pour faire échouer
                // l'enrobage si le fichier est analysé.
                const file = "foo";

                const wrapper = new CoffeeLintCliWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should use default options", async () => {
                const root = await tempFs.create({
                    "foo.coffee": "bar = true || false",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.coffee"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.coffee";

                const wrapper = new CoffeeLintCliWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notices", async () => {
                const root = await tempFs.create({
                    "foo.coffee": "bar =\n\ttrue || false",
                });

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root,
                    files: ["foo.coffee"],
                };
                const options = {
                    /* eslint-disable camelcase */
                    no_tabs: { level: "error" },
                    prefer_english_operator: { level: "warn" },
                    /* eslint-enable camelcase */
                };
                const file = "foo.coffee";

                const wrapper = new CoffeeLintCliWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "coffeelint__cli",
                        rule: "prefer_english_operator",
                        severity: Severities.WARN,
                        message: "Don't use &&, ||, ==, !=, or !",
                        locations: [{ line: 2 }],
                    },
                    {
                        file,
                        linter: "coffeelint__cli",
                        rule: "no_tabs",
                        severity: Severities.ERROR,
                        message: "Line contains tab indentation",
                        locations: [{ line: 2 }],
                    },
                ]);
            });

            it("should ignore warning with ERROR level", async () => {
                const root = await tempFs.create({
                    "foo.coffee": "bar =\n\ttrue || false",
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["foo.coffee"],
                };
                const options = {
                    /* eslint-disable camelcase */
                    no_tabs: { level: "error" },
                    prefer_english_operator: { level: "warn" },
                    /* eslint-enable camelcase */
                };
                const file = "foo.coffee";

                const wrapper = new CoffeeLintCliWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "coffeelint__cli",
                        rule: "no_tabs",
                        severity: Severities.ERROR,
                        message: "Line contains tab indentation",
                        locations: [{ line: 2 }],
                    },
                ]);
            });
        });
    });
});
