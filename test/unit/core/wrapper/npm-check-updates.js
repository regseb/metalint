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
import NpmCheckUpdatesWrapper from "../../../../src/core/wrapper/npm-check-updates.js";

describe("src/core/wrapper/npm-check-updates.js", function () {
    describe("NpmCheckUpdatesWrapper", function () {
        describe("lint()", function () {
            it("should ignore with OFF level", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "package.json": "",
                });

                const context = {
                    level: Levels.OFF,
                    fix: false,
                    root: process.cwd(),
                    files: ["package.json"],
                };
                const options = {};
                const file = "package.json";

                const wrapper = new NpmCheckUpdatesWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notices", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "package.json":
                        '{ "dependencies": { "metalint": "0.10.0" } }',
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root: process.cwd(),
                    files: ["package.json"],
                };
                const options = {};
                const file = "package.json";

                const wrapper = new NpmCheckUpdatesWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "npm-check-updates",
                        message:
                            "Dependency 'metalint' has a new version '0.12.0'.",
                    },
                ]);
            });

            it("should transmit options", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "package.json":
                        '{ "dependencies": { "metalint": "0.10.0" } }',
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root: process.cwd(),
                    files: ["package.json"],
                };
                const options = { dep: ["dev"] };
                const file = "package.json";

                const wrapper = new NpmCheckUpdatesWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should ignore error with FATAL level", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "package.json":
                        '{ "dependencies": { "metalint": "0.10.0" } }',
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["package.json"],
                };
                const options = {};
                const file = "package.json";

                const wrapper = new NpmCheckUpdatesWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return FATAL notice", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "package.json": '<deps><metalint version="0.10.0"></deps>',
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["package.json"],
                };
                const options = {};
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
