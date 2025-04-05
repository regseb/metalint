/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { afterEach, describe, it } from "node:test";
import fc from "fast-check";
import Levels from "../../../../src/core/levels.js";
import AddonsLinterWrapper from "../../../../src/core/wrapper/addons-linter.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/addons-linter.js", () => {
    describe("AddonsLinterWrapper", () => {
        describe("lint()", () => {
            afterEach(async () => {
                await tempFs.reset();
            });

            it("should always return notice", async () => {
                const file = "foo.zip";
                const root = await tempFs.create({ [file]: "" });
                const wrapper = new AddonsLinterWrapper(
                    {
                        level: Levels.INFO,
                        fix: false,
                        root,
                        files: [file],
                    },
                    {},
                );

                await fc.assert(
                    fc.asyncProperty(
                        fc.string({ unit: "binary" }),
                        async (content) => {
                            await fs.writeFile(file, content);

                            const notices = await wrapper.lint(file);
                            for (const notice of notices) {
                                assert.equal(notice.file, file);
                                assert.equal(notice.linter, "addons-linter");
                            }
                        },
                    ),
                );
            });
        });
    });
});
