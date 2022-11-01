import assert from "node:assert/strict";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/standard.js";

describe("src/core/wrapper/standard.js", function () {
    describe("wrapper()", function () {
        it("should ignore with FATAL level", async function () {
            const file  = "";
            const level = SEVERITY.FATAL;

            const notices = await wrapper(file, level);
            assert.deepEqual(notices, []);
        });

        it("should return notices", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                // eslint-disable-next-line camelcase
                node_modules: mock.load("node_modules/"),
                "foo.js":     `const bar = "baz"\n`,
            });

            const file  = "foo.js";
            const level = SEVERITY.ERROR;

            const notices = await wrapper(file, level);
            assert.deepEqual(notices, [
                {
                    file,
                    linter:    "standard",
                    rule:      "no-unused-vars",
                    message:   "'bar' is assigned a value but never used.",
                    locations: [{ line: 1, column: 7 }],
                }, {
                    file,
                    linter:    "standard",
                    rule:      "quotes",
                    message:   "Strings must use singlequote.",
                    locations: [{ line: 1, column: 13 }],
                },
            ]);
        });
    });
});
