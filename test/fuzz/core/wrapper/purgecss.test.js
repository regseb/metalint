/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { afterEach, describe, it } from "node:test";
import fc from "fast-check";
import Levels from "../../../../src/core/levels.js";
import PurgeCSSWrapper from "../../../../src/core/wrapper/purgecss.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/purgecss.js", () => {
    describe("PurgeCSSWrapper", () => {
        describe("lint()", () => {
            afterEach(async () => {
                await tempFs.reset();
            });

            it("should always return notice", async () => {
                const file = "baz.css";
                const root = await tempFs.create({
                    "foo.html": '<html lang="fr"></html>',
                    [file]: "",
                });
                const wrapper = new PurgeCSSWrapper(
                    {
                        level: Levels.ERROR,
                        fix: false,
                        root,
                        files: ["foo.html", file],
                    },
                    { content: "*.html" },
                );

                await fc.assert(
                    fc.asyncProperty(
                        fc.string({ unit: "binary" }),
                        async (content) => {
                            await fs.writeFile(file, content);

                            const notices = await wrapper.lint(file);
                            for (const notice of notices) {
                                assert.equal(notice.file, file);
                                assert.equal(notice.linter, "purgecss");
                            }
                        },
                    ),
                );
            });
        });
    });
});
