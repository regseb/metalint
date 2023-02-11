import assert from "node:assert/strict";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/markuplint.js";

describe("src/core/wrapper/markuplint.js", function () {
    describe("wrapper()", function () {
        it("should ignore with FATAL level", async function () {
            const file    = "";
            const level   = SEVERITY.FATAL;
            const options = undefined;

            const notices = await wrapper(file, level, options);
            assert.deepEqual(notices, []);
        });

        it("should use default options", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.html":      "<title>Foo</title>",
            });

            const file    = "foo.html";
            const level   = SEVERITY.INFO;
            const options = undefined;

            const notices = await wrapper(file, level, options);
            assert.deepEqual(notices, []);
        });

        it("should return notices", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.html":      `<img src='bar.svg' src="" class="BAZ" />`,
            });

            const file    = "foo.html";
            const level   = SEVERITY.INFO;
            const options = {
                rules: {
                    "attr-duplication":  true,
                    "attr-value-quotes": true,
                    "class-naming":      {
                        value:    "/[a-z]+/",
                        severity: "info",
                    },
                },
            };

            const notices = await wrapper(file, level, options);
            assert.deepEqual(notices, [
                {
                    file,
                    linter:    "markuplint",
                    rule:      "attr-duplication",
                    severity:  SEVERITY.ERROR,
                    message:   "The attribute name is duplicated",
                    locations: [{ line: 1, column: 20 }],
                }, {
                    file,
                    linter:    "markuplint",
                    rule:      "attr-value-quotes",
                    severity:  SEVERITY.WARN,
                    message:   "Attribute value is must quote on double" +
                               " quotation mark",
                    locations: [{ line: 1, column: 6 }],
                }, {
                    file,
                    linter:    "markuplint",
                    rule:      "class-naming",
                    severity:  SEVERITY.INFO,
                    message:   `The "BAZ" class name is unmatched with the` +
                               ` below patterns: "/[a-z]+/"`,
                    locations: [{ line: 1, column: 34 }],
                },
            ]);
        });

        it("should ignore warning with ERROR level", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.html":      `<div>
                                    Foo
                                    </div>`,
            });

            const file    = "foo.html";
            const level   = SEVERITY.ERROR;
            const options = { rules: { indentation: true } };

            const notices = await wrapper(file, level, options);
            assert.deepEqual(notices, []);
        });
    });
});
