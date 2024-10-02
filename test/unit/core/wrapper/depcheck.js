/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import path from "node:path";
import process from "node:process";
import { afterEach, describe, it } from "node:test";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import DepcheckWrapper from "../../../../src/core/wrapper/depcheck.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/depcheck.js", () => {
    describe("DepcheckWrapper", () => {
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
                const options = /** @type {Record<string, unknown>} */ ({});
                // Utiliser un fichier qui n'existe pas pour faire échouer
                // l'enrobage si le fichier est analysé.
                const file = "foo";

                const wrapper = new DepcheckWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it('should reject file not ending "package.json"', async () => {
                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo";

                const wrapper = new DepcheckWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        severity: Severities.FATAL,
                        linter: "depcheck",
                        message: 'foo must end with "package.json".',
                    },
                ]);
            });

            it("should return notices", async () => {
                const root = await tempFs.create({
                    "package.json": JSON.stringify({
                        dependencies: { foo: "1.0.0" },
                    }),
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["package.json"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "package.json";

                const wrapper = new DepcheckWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        severity: Severities.ERROR,
                        linter: "depcheck",
                        message:
                            "The dependency 'foo' is declared in the" +
                            " 'package.json' file, but not used by any code.",
                    },
                ]);
            });

            it("should ignore error with FATAL level", async () => {
                const root = await tempFs.create({
                    "package.json": JSON.stringify({
                        dependencies: { foo: "1.0.0" },
                    }),
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root,
                    files: ["package.json"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "package.json";

                const wrapper = new DepcheckWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return FATAL notice", async () => {
                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo/package.json"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo/package.json";

                const wrapper = new DepcheckWrapper(context, options);
                const notices = await wrapper.lint(file);
                // Le répertoire "node_module" dans la sandbox de Stryker est un
                // lien symbolique vers le répertoire "node_module" du projet.
                // Donc les chemins vers les fichiers du répertoire
                // "node_module" n'ont pas les sous-répertoires de la sandbox.
                // https://github.com/stryker-mutator/stryker-js/issues/3978
                const nodeModules = path.join(
                    context.root.replace(
                        /[/\\]\.stryker[/\\]tmp[/\\]sandbox\d+/u,
                        "",
                    ),
                    "node_modules",
                );
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "depcheck",
                        severity: Severities.FATAL,
                        message:
                            "Cannot find module '" +
                            path.join(context.root, "foo", "package.json") +
                            "'\nRequire stack:\n- " +
                            path.join(
                                nodeModules,
                                "depcheck",
                                "dist",
                                "utils",
                                "index.js",
                            ) +
                            "\n- " +
                            path.join(
                                nodeModules,
                                "depcheck",
                                "dist",
                                "check.js",
                            ) +
                            "\n- " +
                            path.join(
                                nodeModules,
                                "depcheck",
                                "dist",
                                "index.js",
                            ),
                    },
                ]);
            });

            it("should return notices from devDependancies", async () => {
                const root = await tempFs.create({
                    "package.json": JSON.stringify({
                        devDependencies: { foo: "1.0.0" },
                    }),
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["package.json"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "package.json";

                const wrapper = new DepcheckWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file: "package.json",
                        severity: Severities.ERROR,
                        linter: "depcheck",
                        message:
                            "The devDependency 'foo' is declared in the" +
                            " 'package.json' file, but not used by any code.",
                    },
                ]);
            });
        });
    });
});
