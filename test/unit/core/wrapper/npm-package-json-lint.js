/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import NpmPackageJSONLintWrapper from "../../../../src/core/wrapper/npm-package-json-lint.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/npm-package-json-lint.js", () => {
    describe("NpmPackageJSONLintWrapper", () => {
        describe("configurable", () => {
            it("should be true", () => {
                assert.ok(NpmPackageJSONLintWrapper.configurable);
            });
        });

        describe("lint()", () => {
            afterEach(async () => {
                await tempFs.reset();
            });

            it("should ignore with OFF level", async () => {
                const root = await tempFs.create({
                    "package.json": "<json />",
                });

                const context = {
                    level: Levels.OFF,
                    fix: false,
                    root,
                    files: ["package.json"],
                };
                // Ne pas définir de règles pour faire échouer l'enrobage si le
                // fichier est analysé.
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "package.json";

                const wrapper = new NpmPackageJSONLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return FATAL notice", async () => {
                const root = await tempFs.create({
                    "package.json": "",
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root,
                    files: ["package.json"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "package.json";

                const wrapper = new NpmPackageJSONLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "npm-package-json-lint",
                        severity: Severities.FATAL,
                        message: "Unexpected end of JSON input",
                    },
                ]);
            });

            it("should return notices", async () => {
                const root = await tempFs.create({
                    "package.json": '{ "name": "FOO" }',
                });

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root,
                    files: ["package.json"],
                };
                const options = {
                    rules: {
                        "require-version": "warning",
                        "name-format": "error",
                    },
                };
                const file = "package.json";

                const wrapper = new NpmPackageJSONLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "npm-package-json-lint",
                        rule: "require-version",
                        severity: Severities.WARN,
                        message: "version is required",
                    },
                    {
                        file,
                        linter: "npm-package-json-lint",
                        rule: "name-format",
                        severity: Severities.ERROR,
                        message: "name can no longer contain capital letters",
                    },
                ]);
            });

            it("should ignore warning with ERROR level", async () => {
                const root = await tempFs.create({ "package.json": "{}" });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["package.json"],
                };
                const options = {
                    rules: {
                        "require-description": "warning",
                        "require-main": "error",
                    },
                };
                const file = "package.json";

                const wrapper = new NpmPackageJSONLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "npm-package-json-lint",
                        rule: "require-main",
                        severity: Severities.ERROR,
                        message: "main is required",
                    },
                ]);
            });
        });
    });
});
