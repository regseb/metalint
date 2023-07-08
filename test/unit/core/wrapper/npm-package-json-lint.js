/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import mock from "mock-fs";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import NpmPackageJSONLintWrapper from "../../../../src/core/wrapper/npm-package-json-lint.js";

describe("src/core/wrapper/npm-package-json-lint.js", function () {
    describe("NpmPackageJSONLintWrapper", function () {
        describe("lint()", function () {
            it("should ignore with FATAL level", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "package.json": "{}",
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["package.json"],
                };
                // Ne pas définir de règles pour faire échouer l'enrobage si le
                // fichier est analysé.
                const options = {};
                const file = "package.json";

                const wrapper = new NpmPackageJSONLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notices", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "package.json": '{ "name": "FOO" }',
                });

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root: process.cwd(),
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

            it("should ignore warning with ERROR level", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "package.json": "{}",
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root: process.cwd(),
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
