/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import { afterEach, describe, it } from "node:test";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import SecretLintWrapper from "../../../../src/core/wrapper/secretlint.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/secretlint.js", () => {
    describe("SecretLintWrapper", () => {
        describe("configurable", () => {
            it("should be true", () => {
                assert.ok(SecretLintWrapper.configurable);
            });
        });

        describe("lint()", () => {
            afterEach(async () => {
                await tempFs.reset();
            });

            it("should ignore with OFF level", async () => {
                const context = {
                    level: Levels.OFF,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo"],
                };
                // Ne pas renseigner la propriété `rules` pour faire échouer le
                // linter (et aussi : utiliser un fichier qui n'existe pas).
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo";

                const wrapper = new SecretLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notices", async () => {
                const root = await tempFs.create({
                    ".npmrc":
                        "//registry.npmjs.org/:_authToken=" +
                        "123e4567-e89b-12d3-a456-426614174000",
                });

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root,
                    files: [".npmrc"],
                };
                const options = {
                    rules: [{ id: "@secretlint/secretlint-rule-npm" }],
                };
                const file = ".npmrc";

                const wrapper = new SecretLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "secretlint",
                        rule: "Npmrc_authToken",
                        severity: Severities.ERROR,
                        message:
                            "found npmrc authToken:" +
                            " 123e4567-e89b-12d3-a456-426614174000",
                        locations: [
                            { line: 1, column: 23, endLine: 1, endColumn: 59 },
                        ],
                    },
                ]);
            });

            it("should return INFO notices", async () => {
                const root = await tempFs.create({
                    ".npmrc":
                        "//registry.npmjs.org/:_authToken=" +
                        "123e4567-e89b-12d3-a456-426614174000",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: [".npmrc"],
                };
                const options = {
                    rules: [
                        {
                            id: "@secretlint/secretlint-rule-npm",
                            severity: "info",
                        },
                    ],
                };
                const file = ".npmrc";

                const wrapper = new SecretLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "secretlint",
                        rule: "Npmrc_authToken",
                        severity: Severities.INFO,
                        message:
                            "found npmrc authToken:" +
                            " 123e4567-e89b-12d3-a456-426614174000",
                        locations: [
                            { line: 1, column: 23, endLine: 1, endColumn: 59 },
                        ],
                    },
                ]);
            });

            it("should ignore warning with ERROR level", async () => {
                const root = await tempFs.create({
                    ".npmrc":
                        "//registry.npmjs.org/:_authToken=" +
                        "123e4567-e89b-12d3-a456-426614174000",
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: [".npmrc"],
                };
                const options = {
                    rules: [
                        {
                            id: "@secretlint/secretlint-rule-npm",
                            severity: "warning",
                        },
                    ],
                };
                const file = ".npmrc";

                const wrapper = new SecretLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return generic FATAL notices", async () => {
                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo"],
                };
                const options = /** @type {Record<string, unknown>} */ ({
                    rules: [],
                });
                // Utiliser un fichier qui n'existe pas pour faire échouer le
                // linter.
                const file = "foo";

                const wrapper = new SecretLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "secretlint",
                        severity: Severities.FATAL,
                        message: "Not found target files",
                    },
                ]);
            });

            it("should return FATAL notices", async () => {
                const root = await tempFs.create({ "foo.json": "{}" });
                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.json"],
                };
                const options = {
                    rules: [{ id: "@secretlint/bar" }],
                };
                const file = "foo.json";

                const wrapper = new SecretLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "secretlint",
                        severity: Severities.FATAL,
                        message:
                            "Failed to load rule module: @secretlint/bar\n\n" +
                            "Error: Failed to load secretlint's rule module:" +
                            ' "@secretlint/bar" is not found.\n\n' +
                            `cwd: ${root}\n` +
                            "baseDir: \n",
                    },
                ]);
            });
        });
    });
});
