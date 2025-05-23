/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import { afterEach, describe, it } from "node:test";
import Levels from "../../../../src/core/levels.js";
import DoIUseWrapper from "../../../../src/core/wrapper/doiuse.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/doiuse.js", () => {
    describe("DoIUseWrapper", () => {
        describe("configurable", () => {
            it("should be true", () => {
                assert.ok(DoIUseWrapper.configurable);
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

                const wrapper = new DoIUseWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should use default options", async () => {
                const root = await tempFs.create({
                    // Ajouter un saut de ligne à la fin, sinon doiuse affiche
                    // le texte suivant dans la console : "[css-tokenize]
                    // unfinished business [ [ 'root' ] ]".
                    "foo.css": "button { border-radius: 10px; }\n",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.css"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.css";

                const wrapper = new DoIUseWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "doiuse",
                        rule: "border-radius",
                        message:
                            "CSS3 Border-radius (rounded corners) not" +
                            " supported by: Opera Mini (all)",
                        locations: [{ line: 1, column: 10 }],
                    },
                ]);
            });

            it("should return notices", async () => {
                const root = await tempFs.create({
                    // Ajouter un saut de ligne à la fin, sinon doiuse affiche
                    // le texte suivant dans la console : "[css-tokenize]
                    // unfinished business [ [ 'root' ] ]".
                    "foo.css": "div { background-size: cover; }\n",
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["foo.css"],
                };
                const options = { browser: "ie >= 9, > 1%, last 2 versions" };
                const file = "foo.css";

                const wrapper = new DoIUseWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "doiuse",
                        rule: "background-img-opts",
                        message:
                            "CSS3 Background-image options only partially" +
                            " supported by: Opera Mini (all)",
                        locations: [{ line: 1, column: 7 }],
                    },
                ]);
            });
        });
    });
});
