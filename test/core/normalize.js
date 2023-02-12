/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mock from "mock-fs";
import { Formatter as Console } from "../../src/core/formatter/console.js";
import { Formatter as Unix } from "../../src/core/formatter/unix.js";
import normalize from "../../src/core/normalize.js";
import SEVERITY from "../../src/core/severity.js";
import { Formatter as French } from "../data/french.js";

if (undefined === import.meta.resolve) {
    /**
     * Résous un chemin relatif à partir du module.
     *
     * @param {string} specifier Le chemin relatif vers un fichier ou un
     *                           répertoire.
     * @returns {Promise<string>} Une promesse contenant le chemin absolue vers
     *                            le fichier ou le répertoire.
     * @see https://nodejs.org/api/esm.html#importmetaresolvespecifier-parent
     */
    import.meta.resolve = (specifier) => {
        return Promise.resolve(
            fileURLToPath(new URL(specifier, import.meta.url).href),
        );
    };
}

describe("src/core/normalize.js", function () {
    describe("merge()", function () {
        it("should merge two object", async function () {
            const rotten = {
                checkers: [
                    {
                        linters: {
                            eslint: [
                                {
                                    plugins: ["foo"],
                                    global: "foo",
                                    rules: ["foo"],
                                },
                                {
                                    plugins: ["bar", "baz"],
                                    global: "bar",
                                    rules: { bar: "baz" },
                                },
                            ],
                        },
                    },
                ],
            };
            const root = ".";
            const dir = ".";
            const overwriting = {};
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(
                standard.checkers[0].linters["./wrapper/eslint.js"],
                {
                    plugins: ["bar", "baz"],
                    global: "bar",
                    rules: { bar: "baz" },
                },
            );
        });
    });

    describe("read()", function () {
        it("should read config file", async function () {
            const rotten = { checkers: [{ linters: "eslint" }] };
            const root = ".";
            const dir = "../../.metalint/";
            const overwriting = {};
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(
                standard.checkers[0].linters["./wrapper/eslint.js"]
                    .parserOptions,
                {
                    sourceType: "module",
                },
            );
        });

        it("should throw error without config file", async function () {
            const rotten = { checkers: [{ linters: "jshint" }] };
            const root = ".";
            const dir = "../.metalint/";
            const overwriting = {};
            await assert.rejects(
                () => normalize(rotten, root, dir, overwriting),
                {
                    name: "Error",
                    message: "Cannot import '../.metalint/jshint.config.js'.",
                },
            );
        });
    });

    describe("patterns()", function () {
        it("should overwrite patterns", async function () {
            const rotten = { checkers: [{ linters: { eslint: {} } }] };
            const root = ".";
            const dir = ".";
            const overwriting = { patterns: ["*.js"] };
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(standard.patterns, ["*.js"]);
        });

        it("should use default patterns", async function () {
            const rotten = { checkers: [{ linters: { eslint: {} } }] };
            const root = ".";
            const dir = ".";
            const overwriting = {};
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(standard.patterns, ["**"]);
        });

        it("should support one pattern", async function () {
            const rotten = {
                patterns: "*.css",
                checkers: [{ linters: { eslint: {} } }],
            };
            const root = ".";
            const dir = ".";
            const overwriting = {};
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(standard.patterns, ["*.css"]);
        });

        it("should support many patterns", async function () {
            const rotten = {
                patterns: ["src/**", "!**/test/"],
                checkers: [{ linters: { eslint: {} } }],
            };
            const root = ".";
            const dir = ".";
            const overwriting = {};
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(standard.patterns, ["src/**", "!**/test/"]);
        });

        it("should reject invalid patterns", async function () {
            const rotten = {
                patterns: true,
                checkers: [{ linters: { eslint: {} } }],
            };
            const root = ".";
            const dir = ".";
            const overwriting = {};
            await assert.rejects(
                () => normalize(rotten, root, dir, overwriting),
                {
                    name: "TypeError",
                    message:
                        "Property 'patterns' is incorrect type (string and" +
                        " array are accepted).",
                },
            );
        });
    });

    describe("level()", function () {
        it("level() #1", async function () {
            const rotten = { checkers: [{ linters: { eslint: {} } }] };
            const root = ".";
            const dir = ".";
            const overwriting = { level: "error" };
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.equal(standard.level, SEVERITY.ERROR);
        });

        it("level() #2", async function () {
            const rotten = {
                level: "error",
                checkers: [{ linters: { eslint: {} } }],
            };
            const root = ".";
            const dir = ".";
            const overwriting = { level: "warn" };
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.equal(standard.level, SEVERITY.WARN);
        });
    });

    describe("formatter()", function () {
        it("formatter() #1", async function () {
            const rotten = {
                reporter: {},
                checkers: [{ linters: { eslint: {} } }],
            };
            const root = ".";
            const dir = ".";
            const overwriting = { formatter: "unix" };
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(standard.reporters, [
                new Unix(SEVERITY.INFO, process.stdout),
            ]);
        });

        it("formatter() #2", async function () {
            const rotten = {
                level: "error",
                reporter: { formatter: "console" },
                checkers: [{ linters: { eslint: {} } }],
            };
            const root = ".";
            const dir = ".";
            const overwriting = { formatter: "unix" };
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(standard.reporters, [
                new Unix(SEVERITY.ERROR, process.stdout),
            ]);
        });

        it("formatter() #3", async function () {
            const rotten = { reporters: { formatter: false } };
            const root = ".";
            const dir = ".";
            const overwriting = {};
            await assert.rejects(
                () => normalize(rotten, root, dir, overwriting),
                {
                    name: "TypeError",
                    message:
                        "Property 'formatter' is incorrect type (only string" +
                        " is accepted).",
                },
            );
        });
    });

    describe("output()", function () {
        it("output() #1", async function () {
            const rotten = { reporters: { output: "/output.log" } };
            const root = ".";
            const dir = ".";
            const overwriting = {};
            await assert.rejects(
                () => normalize(rotten, root, dir, overwriting),
                {
                    name: "Error",
                    message:
                        "Permission denied to open output file '/output.log'.",
                },
            );
        });

        it("output() #2", async function () {
            const rotten = { reporters: { output: "./not_exist/output.log" } };
            const root = ".";
            const dir = ".";
            const overwriting = {};
            await assert.rejects(
                () => normalize(rotten, root, dir, overwriting),
                {
                    name: "Error",
                    message:
                        "Permission denied to open output file" +
                        " './not_exist/output.log'.",
                },
            );
        });

        it("output() #3", async function () {
            const rotten = { reporters: { output: false } };
            const root = ".";
            const dir = ".";
            const overwriting = {};
            await assert.rejects(
                () => normalize(rotten, root, dir, overwriting),
                {
                    name: "TypeError",
                    message:
                        "Property 'output' is incorrect type (only string is" +
                        " accepted).",
                },
            );
        });
    });

    describe("options()", function () {
        it("options() #1", async function () {
            const rotten = {
                reporters: { options: { showZeroNotice: true } },
                checkers: [{ linters: { markdownlint: undefined } }],
            };
            const root = ".";
            const dir = ".";
            const overwriting = {};
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(standard, {
                patterns: ["**"],
                level: SEVERITY.INFO,
                reporters: [
                    new Console(SEVERITY.INFO, process.stdout, {
                        showZeroNotice: true,
                    }),
                ],
                checkers: [
                    {
                        patterns: ["**"],
                        level: SEVERITY.INFO,
                        linters: { "./wrapper/markdownlint.js": undefined },
                    },
                ],
            });
        });

        it("options() #2", async function () {
            const rotten = { reporters: { options: false } };
            const root = ".";
            const dir = ".";
            const overwriting = {};
            await assert.rejects(
                () => normalize(rotten, root, dir, overwriting),
                {
                    name: "TypeError",
                    message:
                        "Property 'options' is incorrect type (only object is" +
                        " accepted).",
                },
            );
        });
    });

    describe("reporters()", function () {
        it("reporters() #1", async function () {
            const rotten = {
                checkers: [{ linters: { markdownlint: undefined } }],
            };
            const root = ".";
            const dir = ".";
            const overwriting = {};
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(standard, {
                patterns: ["**"],
                level: SEVERITY.INFO,
                reporters: [new Console(SEVERITY.INFO, process.stdout, {})],
                checkers: [
                    {
                        patterns: ["**"],
                        level: SEVERITY.INFO,
                        linters: { "./wrapper/markdownlint.js": undefined },
                    },
                ],
            });
        });

        it("reporters() #2", async function () {
            const rotten = {
                reporters: [],
                checkers: [{ linters: { markdownlint: undefined } }],
            };
            const root = ".";
            const dir = ".";
            const overwriting = {};
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(standard, {
                patterns: ["**"],
                level: SEVERITY.INFO,
                reporters: [],
                checkers: [
                    {
                        patterns: ["**"],
                        level: SEVERITY.INFO,
                        linters: { "./wrapper/markdownlint.js": undefined },
                    },
                ],
            });
        });

        it("reporters() #3", async function () {
            const rotten = {
                reporters: {},
                checkers: [{ linters: { markdownlint: undefined } }],
            };
            const root = ".";
            const dir = ".";
            const overwriting = {};
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(standard, {
                patterns: ["**"],
                level: SEVERITY.INFO,
                reporters: [new Console(SEVERITY.INFO, process.stdout, {})],
                checkers: [
                    {
                        patterns: ["**"],
                        level: SEVERITY.INFO,
                        linters: { "./wrapper/markdownlint.js": undefined },
                    },
                ],
            });
        });

        it("reporters() #4", async function () {
            const rotten = {
                reporters: [{}],
                checkers: [{ linters: { markdownlint: undefined } }],
            };
            const root = ".";
            const dir = ".";
            const overwriting = {};
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(standard, {
                patterns: ["**"],
                level: SEVERITY.INFO,
                reporters: [new Console(SEVERITY.INFO, process.stdout, {})],
                checkers: [
                    {
                        patterns: ["**"],
                        level: SEVERITY.INFO,
                        linters: { "./wrapper/markdownlint.js": undefined },
                    },
                ],
            });
        });

        it("reporters() #5", async function () {
            const rotten = {
                checkers: [{ linters: { markdownlint: undefined } }],
            };
            const root = ".";
            const dir = ".";
            const overwriting = { formatter: "unix" };
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(standard, {
                patterns: ["**"],
                level: SEVERITY.INFO,
                reporters: [new Unix(SEVERITY.INFO, process.stdout)],
                checkers: [
                    {
                        patterns: ["**"],
                        level: SEVERITY.INFO,
                        linters: { "./wrapper/markdownlint.js": undefined },
                    },
                ],
            });
        });

        it("reporters() #6", async function () {
            const rotten = {
                reporters: [],
                checkers: [{ linters: { markdownlint: undefined } }],
            };
            const root = ".";
            const dir = ".";
            const overwriting = { formatter: "unix" };
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(standard, {
                patterns: ["**"],
                level: SEVERITY.INFO,
                reporters: [new Unix(SEVERITY.INFO, process.stdout)],
                checkers: [
                    {
                        patterns: ["**"],
                        level: SEVERITY.INFO,
                        linters: { "./wrapper/markdownlint.js": undefined },
                    },
                ],
            });
        });

        it("reporters() #7", async function () {
            const rotten = {
                reporters: [{}],
                checkers: [{ linters: { markdownlint: undefined } }],
            };
            const root = ".";
            const dir = ".";
            const overwriting = { formatter: "unix" };
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(standard, {
                patterns: ["**"],
                level: SEVERITY.INFO,
                reporters: [new Unix(SEVERITY.INFO, process.stdout)],
                checkers: [
                    {
                        patterns: ["**"],
                        level: SEVERITY.INFO,
                        linters: { "./wrapper/markdownlint.js": undefined },
                    },
                ],
            });
        });

        it("reporters() #8", async function () {
            const rotten = {
                reporters: {},
                checkers: [{ linters: { markdownlint: undefined } }],
            };
            const root = ".";
            const dir = ".";
            const overwriting = { formatter: "unix" };
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(standard, {
                patterns: ["**"],
                level: SEVERITY.INFO,
                reporters: [new Unix(SEVERITY.INFO, process.stdout)],
                checkers: [
                    {
                        patterns: ["**"],
                        level: SEVERITY.INFO,
                        linters: { "./wrapper/markdownlint.js": undefined },
                    },
                ],
            });
        });
    });

    describe("normalize()", function () {
        it("should use default values", async function () {
            const rotten = { checkers: [{ linters: { eslint: {} } }] };
            const root = ".";
            const dir = ".";
            const overwriting = {};
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(standard, {
                patterns: ["**"],
                level: SEVERITY.INFO,
                reporters: [new Console(SEVERITY.INFO, process.stdout, {})],
                checkers: [
                    {
                        patterns: ["**"],
                        level: SEVERITY.INFO,
                        linters: { "./wrapper/eslint.js": {} },
                    },
                ],
            });
        });

        it("normalize() #1", async function () {
            const rotten = {
                reporters: { formatter: "./french.js" },
                checkers: [{ linters: { eslint: {} } }],
            };
            const root = await import.meta.resolve("../data/");
            const dir = ".";
            const overwriting = {};
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(standard, {
                patterns: ["**"],
                level: SEVERITY.INFO,
                reporters: [new French(SEVERITY.INFO, process.stdout)],
                checkers: [
                    {
                        patterns: ["**"],
                        level: SEVERITY.INFO,
                        linters: { "./wrapper/eslint.js": {} },
                    },
                ],
            });
        });

        it("normalize() #2", async function () {
            mock({
                "metalint/": {
                    "csslintrc.js":
                        "export default {\n" +
                        `    "empty-rules": true,\n` +
                        "};",
                    "eslint.config.js":
                        "export default {\n" +
                        "    rules: {\n" +
                        `        "no-empty": 2,\n` +
                        "        curly: 2,\n" +
                        "    },\n" +
                        "};",
                    "htmlhint.config.js":
                        "export default {\n" +
                        `    "tagname-lowercase":` +
                        " true,\n" +
                        "};",
                    "htmllint.config.js":
                        "export default {\n" +
                        `    "doctype-html5": true,\n` +
                        "};",
                    "markdownlint.config.js":
                        "export default {\n" +
                        `    MD035: { style: "---" },\n` +
                        "};\n",
                },
                "src/core/formatter/": mock.load("src/core/formatter/"),
                "src/core/wrapper/": mock.load("src/core/wrapper/"),
            });

            const rotten = {
                patterns: "**.js",
                level: "Error",
                reporters: { formatter: "unix", output: undefined },
                checkers: [
                    {
                        level: "info",
                        linters: "markdownlint",
                    },
                    {
                        patterns: ["!**.min.js", "**"],
                        linters: {
                            eslint: [
                                "eslint.config.js",
                                { rules: { curly: 1, "no-var": 2 } },
                            ],
                        },
                    },
                    {
                        linters: ["htmllint", "htmlhint"],
                    },
                    {
                        linters: { csslint: "csslintrc.js" },
                    },
                ],
            };
            const root = process.cwd();
            const dir = path.join(process.cwd(), "metalint/");
            const overwriting = {};
            const standard = await normalize(rotten, root, dir, overwriting);
            assert.deepEqual(standard, {
                patterns: ["**.js"],
                level: SEVERITY.ERROR,
                reporters: [new Unix(SEVERITY.ERROR, process.stdout, {})],
                checkers: [
                    {
                        patterns: ["**"],
                        level: SEVERITY.ERROR,
                        linters: {
                            "./wrapper/markdownlint.js": {
                                MD035: { style: "---" },
                            },
                        },
                    },
                    {
                        patterns: ["!**.min.js", "**"],
                        level: SEVERITY.ERROR,
                        linters: {
                            "./wrapper/eslint.js": {
                                rules: { "no-empty": 2, curly: 1, "no-var": 2 },
                            },
                        },
                    },
                    {
                        patterns: ["**"],
                        level: SEVERITY.ERROR,
                        linters: {
                            "./wrapper/htmlhint.js": {
                                "tagname-lowercase": true,
                            },
                            "./wrapper/htmllint.js": { "doctype-html5": true },
                        },
                    },
                    {
                        patterns: ["**"],
                        level: SEVERITY.ERROR,
                        linters: {
                            "./wrapper/csslint.js": { "empty-rules": true },
                        },
                    },
                ],
            });
        });

        it("should reject invalid data", async function () {
            const rotten = { checkers: [{ linters: { jsonlint: [1] } }] };
            await assert.rejects(() => normalize(rotten, ".", ".", {}), {
                name: "TypeError",
                message: "Linter option incorrect type.",
            });

            rotten.checkers[0].linters.jsonlint[0] = undefined;
            await assert.rejects(() => normalize(rotten, ".", ".", {}), {
                name: "Error",
                message: "Linter option is undefined.",
            });

            // Tester que la valeur null est gérée.
            // eslint-disable-next-line unicorn/no-null
            rotten.checkers[0].linters.jsonlint[0] = null;
            await assert.rejects(() => normalize(rotten, ".", ".", {}), {
                name: "Error",
                message: "Linter option is null.",
            });

            rotten.checkers[0].linters.jsonlint = 1;
            await assert.rejects(() => normalize(rotten, ".", ".", {}), {
                name: "TypeError",
                message: "Linter incorrect type.",
            });

            rotten.checkers[0].linters = 1;
            await assert.rejects(() => normalize(rotten, ".", ".", {}), {
                name: "TypeError",
                message: "'checkers[].linters' incorrect type.",
            });

            // Tester que la valeur null est gérée.
            // eslint-disable-next-line unicorn/no-null
            rotten.checkers[0].linters = null;
            await assert.rejects(() => normalize(rotten, ".", ".", {}), {
                name: "Error",
                message: "'checkers[].linters' is null.",
            });

            Reflect.deleteProperty(rotten.checkers[0], "linters");
            await assert.rejects(() => normalize(rotten, ".", ".", {}), {
                name: "Error",
                message: "'checkers[].linters' is undefined.",
            });

            rotten.checkers.length = 0;
            await assert.rejects(() => normalize(rotten, ".", ".", {}), {
                name: "Error",
                message: "'checkers' is empty.",
            });

            rotten.checkers = 1;
            await assert.rejects(() => normalize(rotten, ".", ".", {}), {
                name: "TypeError",
                message: "'checkers' is not an array.",
            });

            rotten.reporters = 1;
            await assert.rejects(() => normalize(rotten, ".", ".", {}), {
                name: "TypeError",
                message: "'reporters' incorrect type.",
            });

            rotten.level = "APOCALYPSE";
            await assert.rejects(() => normalize(rotten, ".", ".", {}), {
                name: "Error",
                message:
                    "Value of property 'level' is unknown (possibles values:" +
                    " 'off', 'fatal', 'error', 'warn' and 'info').",
            });

            rotten.level = 1;
            await assert.rejects(() => normalize(rotten, ".", ".", {}), {
                name: "TypeError",
                message:
                    "Property 'level' is incorrect type (only string is" +
                    " accepted).",
            });
        });
    });
});
