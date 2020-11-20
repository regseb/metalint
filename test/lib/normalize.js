import assert from "assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { normalize } from "../../lib/normalize.js";
import { SEVERITY } from "../../lib/severity.js";
import { Formatter as Console } from "../../lib/formatter/console.js";
import { Formatter as Unix } from "../../lib/formatter/unix.js";
import { Formatter as French } from "../data/formatter/french.js";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

describe("lib/normalize.js", function () {
    it("", async function () {
        const rotten = { checkers: [{ linters: { eslint: {} } }] };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = await normalize(rotten, root, dir, {});

        assert.deepStrictEqual(standard, {
            patterns:  ["**"],
            level:     SEVERITY.INFO,
            reporters: [
                new Console(SEVERITY.INFO, process.stdout, {}),
            ],
            checkers:  [
                {
                    patterns: ["**"],
                    level:    SEVERITY.INFO,
                    linters:  {
                        "./wrapper/eslint.js": {},
                    },
                },
            ],
        });
    });

    it("", async function () {
        const rotten = {
            patterns:  "**.js",
            level:     "Error",
            reporters: {
                formatter: "unix",
                output:    null,
            },
            checkers:  [
                {
                    level:   "info",
                    linters: "markdownlint",
                }, {
                    patterns: ["!**.min.js", "**"],
                    linters:  {
                        eslint: [
                            "eslint.config.js",
                            { rules: { curly: 1, "no-var": 2 } },
                        ],
                    },
                }, {
                    linters: ["htmllint", "htmlhint"],
                }, {
                    linters: { csslint: "csslintrc.js" },
                },
            ],
        };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = await normalize(rotten, root, dir, {});

        assert.deepStrictEqual(standard, {
            patterns:  ["**.js"],
            level:     SEVERITY.ERROR,
            reporters: [new Unix(SEVERITY.ERROR, process.stdout, {})],
            checkers:  [
                {
                    patterns: ["**"],
                    level:    SEVERITY.ERROR,
                    linters:  {
                        "./wrapper/markdownlint.js": {
                            MD035: { style: "---" },
                        },
                    },
                }, {
                    patterns: ["!**.min.js", "**"],
                    level:    SEVERITY.ERROR,
                    linters:  {
                        "./wrapper/eslint.js": {
                            rules: { "no-empty": 2, curly: 1, "no-var": 2 },
                        },
                    },
                }, {
                    patterns: ["**"],
                    level:    SEVERITY.ERROR,
                    linters:  {
                        "./wrapper/htmlhint.js": { "tagname-lowercase": true },
                        "./wrapper/htmllint.js": { "doctype-html5": true },
                    },
                }, {
                    patterns: ["**"],
                    level:    SEVERITY.ERROR,
                    linters:  {
                        "./wrapper/csslint.js": { "empty-rules": true },
                    },
                },
            ],
        });
    });

    it("patterns()", async function () {
        const rotten = { checkers: [{ linters: { eslint: {} } }] };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");
        const overwriting = { patterns: ["*.js"] };
        const standard = await normalize(rotten, root, dir, overwriting);

        assert.deepStrictEqual(standard.patterns, ["*.js"]);
    });

    it("patterns()", async function () {
        const rotten = {
            patterns: "*.html",
            checkers: [{ linters: { eslint: {} } }],
        };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");
        const overwriting = { patterns: ["src/**/*.css"] };
        const standard = await normalize(rotten, root, dir, overwriting);

        assert.deepStrictEqual(standard.patterns, ["src/**/*.css"]);
    });

    it("level()", async function () {
        const rotten = { checkers: [{ linters: { eslint: {} } }] };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");
        const overwriting = { level: "error" };
        const standard = await normalize(rotten, root, dir, overwriting);

        assert.strictEqual(standard.level, SEVERITY.ERROR);
    });

    it("level()", async function () {
        const rotten = {
            level:    "error",
            checkers: [{ linters: { eslint: {} } }],
        };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");
        const overwriting = { level: "warn" };
        const standard = await normalize(rotten, root, dir, overwriting);

        assert.strictEqual(standard.level, SEVERITY.WARN);
    });

    it("formatter()", async function () {
        const rotten = {
            reporter: {},
            checkers: [{ linters: { eslint: {} } }],
        };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");
        const overwriting = { formatter: "unix" };
        const standard = await normalize(rotten, root, dir, overwriting);

        assert.deepStrictEqual(standard.reporters,
                               [new Unix(SEVERITY.INFO, process.stdout, {})]);
    });

    it("formatter()", async function () {
        const rotten = {
            level:    "error",
            reporter: { formatter: "console" },
            checkers: [{ linters: { eslint: {} } }],
        };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");
        const overwriting = { formatter: "unix" };
        const standard = await normalize(rotten, root, dir, overwriting);

        assert.deepStrictEqual(standard.reporters,
                               [new Unix(SEVERITY.ERROR, process.stdout, {})]);
    });

    it("formatter()", async function () {
        const rotten = { reporters: { formatter: false } };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");

        await assert.rejects(() => normalize(rotten, root, dir, {}), {
            name:    "TypeError",
            message: "property 'formatter' is incorrect type (only string is" +
                     " accepted).",
        });
    });

    it("output() #1", async function () {
        const rotten = {
            reporter: {},
            checkers: [{ linters: { eslint: {} } }],
        };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");
        const overwriting = { output: "./output.test" };
        const standard = await normalize(rotten, root, dir, overwriting);

        assert.notStrictEqual(standard.reporters[0].writer, process.stdout);
        fs.unlinkSync(path.join(root, overwriting.output));
    });

    it("output() #2", async function () {
        const rotten = { reporters: { output: "/output.log" } };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");

        await assert.rejects(() => normalize(rotten, root, dir, {}), {
            name:    "Error",
            message: "permission denied to open output file '/output.log'.",
        });
    });

    it("output() #3", async function () {
        const rotten = { reporters: { output: "./not_exist/output.log" } };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");

        await assert.rejects(() => normalize(rotten, root, dir, {}), {
            name:    "Error",
            message: "permission denied to open output file" +
                     " './not_exist/output.log'.",
        });
    });

    it("output() #4", async function () {
        const rotten = { reporters: { output: false } };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");

        await assert.rejects(() => normalize(rotten, root, dir, {}), {
            name:    "TypeError",
            message: "property 'output' is incorrect type (only string is" +
                     " accepted).",
        });
    });

    it("options()", async function () {
        const rotten = {
            reporters: { options: { showZeroNotice: true } },
            checkers:  [{ linters: { markdownlint: null } }],
        };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = await normalize(rotten, root, dir, {});

        assert.deepStrictEqual(standard, {
            patterns:  ["**"],
            level:     SEVERITY.INFO,
            reporters: [
                new Console(SEVERITY.INFO, process.stdout, {
                    showZeroNotice: true,
                }),
            ],
            checkers:  [
                {
                    patterns: ["**"],
                    level:    SEVERITY.INFO,
                    linters:  {
                        "./wrapper/markdownlint.js": null,
                    },
                },
            ],
        });
    });

    it("options()", async function () {
        const rotten = { reporters: { options: false } };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");

        await assert.rejects(() => normalize(rotten, root, dir, {}), {
            name:    "TypeError",
            message: "property 'options' is incorrect type (only object is" +
                     " accepted).",
        });
    });

    it("reporters()", async function () {
        const rotten = {
            checkers: [{ linters: { markdownlint: null } }],
        };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = await normalize(rotten, root, dir, {});

        assert.deepStrictEqual(standard, {
            patterns:  ["**"],
            level:     SEVERITY.INFO,
            reporters: [
                new Console(SEVERITY.INFO, process.stdout, {}),
            ],
            checkers:  [
                {
                    patterns: ["**"],
                    level:    SEVERITY.INFO,
                    linters:  {
                        "./wrapper/markdownlint.js": null,
                    },
                },
            ],
        });
    });

    it("reporters()", async function () {
        const rotten = {
            reporters: [],
            checkers:  [{ linters: { markdownlint: null } }],
        };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = await normalize(rotten, root, dir, {});

        assert.deepStrictEqual(standard, {
            patterns:  ["**"],
            level:     SEVERITY.INFO,
            reporters: [],
            checkers:  [
                {
                    patterns: ["**"],
                    level:    SEVERITY.INFO,
                    linters:  {
                        "./wrapper/markdownlint.js": null,
                    },
                },
            ],
        });
    });

    it("reporters()", async function () {
        const rotten = {
            reporters: {},
            checkers:  [{ linters: { markdownlint: null } }],
        };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = await normalize(rotten, root, dir, {});

        assert.deepStrictEqual(standard, {
            patterns:  ["**"],
            level:     SEVERITY.INFO,
            reporters: [
                new Console(SEVERITY.INFO, process.stdout, {}),
            ],
            checkers:  [
                {
                    patterns: ["**"],
                    level:    SEVERITY.INFO,
                    linters:  {
                        "./wrapper/markdownlint.js": null,
                    },
                },
            ],
        });
    });

    it("reporters()", async function () {
        const rotten = {
            reporters: [{}],
            checkers:  [{ linters: { markdownlint: null } }],
        };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = await normalize(rotten, root, dir, {});

        assert.deepStrictEqual(standard, {
            patterns:  ["**"],
            level:     SEVERITY.INFO,
            reporters: [
                new Console(SEVERITY.INFO, process.stdout, {}),
            ],
            checkers:  [
                {
                    patterns: ["**"],
                    level:    SEVERITY.INFO,
                    linters:  {
                        "./wrapper/markdownlint.js": null,
                    },
                },
            ],
        });
    });

    it("reporters()", async function () {
        const rotten = {
            checkers:  [{ linters: { markdownlint: null } }],
        };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = await normalize(rotten, root, dir, {
            formatter: "unix",
        });

        assert.deepStrictEqual(standard, {
            patterns:  ["**"],
            level:     SEVERITY.INFO,
            reporters: [
                new Unix(SEVERITY.INFO, process.stdout, {}),
            ],
            checkers:  [
                {
                    patterns: ["**"],
                    level:    SEVERITY.INFO,
                    linters:  {
                        "./wrapper/markdownlint.js": null,
                    },
                },
            ],
        });
    });

    it("reporters()", async function () {
        const rotten = {
            reporters: [],
            checkers:  [{ linters: { markdownlint: null } }],
        };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = await normalize(rotten, root, dir, {
            formatter: "unix",
        });

        assert.deepStrictEqual(standard, {
            patterns:  ["**"],
            level:     SEVERITY.INFO,
            reporters: [
                new Unix(SEVERITY.INFO, process.stdout, {}),
            ],
            checkers:  [
                {
                    patterns: ["**"],
                    level:    SEVERITY.INFO,
                    linters:  {
                        "./wrapper/markdownlint.js": null,
                    },
                },
            ],
        });
    });

    it("reporters()", async function () {
        const rotten = {
            reporters: [{}],
            checkers:  [{ linters: { markdownlint: null } }],
        };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = await normalize(rotten, root, dir, {
            formatter: "unix",
        });

        assert.deepStrictEqual(standard, {
            patterns:  ["**"],
            level:     SEVERITY.INFO,
            reporters: [
                new Unix(SEVERITY.INFO, process.stdout, {}),
            ],
            checkers:  [
                {
                    patterns: ["**"],
                    level:    SEVERITY.INFO,
                    linters:  {
                        "./wrapper/markdownlint.js": null,
                    },
                },
            ],
        });
    });

    it("reporters()", async function () {
        const rotten = {
            reporters: {},
            checkers:  [{ linters: { markdownlint: null } }],
        };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = await normalize(rotten, root, dir, {
            formatter: "unix",
        });

        assert.deepStrictEqual(standard, {
            patterns:  ["**"],
            level:     SEVERITY.INFO,
            reporters: [
                new Unix(SEVERITY.INFO, process.stdout, {}),
            ],
            checkers:  [
                {
                    patterns: ["**"],
                    level:    SEVERITY.INFO,
                    linters:  {
                        "./wrapper/markdownlint.js": null,
                    },
                },
            ],
        });
    });

    it("merge()", async function () {
        const rotten = {
            checkers: [
                {
                    linters: {
                        eslint: [
                            {
                                plugins: ["foo"],
                                global:  "foo",
                                rules:   ["foo"],
                            }, {
                                plugins: ["bar", "baz"],
                                global:  "bar",
                                rules:   { bar: "baz" },
                            },
                        ],
                    },
                },
            ],
        };
        const root = path.join(DIRNAME, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = await normalize(rotten, root, dir, {});

        assert.deepStrictEqual(standard, {
            patterns:  ["**"],
            level:     SEVERITY.INFO,
            reporters: [
                new Console(SEVERITY.INFO, process.stdout, {}),
            ],
            checkers:  [
                {
                    patterns: ["**"],
                    level:    SEVERITY.INFO,
                    linters:  {
                        "./wrapper/eslint.js": {
                            plugins: ["bar", "baz"],
                            global:  "bar",
                            rules:   { bar: "baz" },
                        },
                    },
                },
            ],
        });
    });

    it("", async function () {
        const rotten = {
            reporters: { formatter: "./formatter/french.js" },
            checkers:  [{ linters: { eslint: {} } }],
        };
        const root = path.join(DIRNAME, "../data/");
        const standard = await normalize(rotten, root, null, {});
        assert.deepStrictEqual(standard, {
            patterns:  ["**"],
            level:     SEVERITY.INFO,
            reporters: [
                new French(SEVERITY.INFO, process.stdout),
            ],
            checkers:  [
                {
                    patterns: ["**"],
                    level:    SEVERITY.INFO,
                    linters:  {
                        "./wrapper/eslint.js": {},
                    },
                },
            ],
        });
    });

    it("", async function () {
        const rotten = { checkers: [{ linters: { jsonlint: [1] } }] };
        await assert.rejects(() => normalize(rotten, null, null, {}), {
            name:    "TypeError",
            message: "linter option incorrect type.",
        });

        rotten.checkers[0].linters.jsonlint[0] = null;
        await assert.rejects(() => normalize(rotten, null, null, {}), {
            name:    "Error",
            message: "linter option is null.",
        });

        rotten.checkers[0].linters.jsonlint = 1;
        await assert.rejects(() => normalize(rotten, null, null, {}), {
            name:    "TypeError",
            message: "linter incorrect type.",
        });

        rotten.checkers[0].linters = 1;
        await assert.rejects(() => normalize(rotten, null, null, {}), {
            name:    "TypeError",
            message: "'checkers[].linters' incorrect type.",
        });

        rotten.checkers[0].linters = null;
        await assert.rejects(() => normalize(rotten, null, null, {}), {
            name:    "Error",
            message: "'checkers[].linters' is null.",
        });

        Reflect.deleteProperty(rotten.checkers[0], "linters");
        await assert.rejects(() => normalize(rotten, null, null, {}), {
            name:    "Error",
            message: "'checkers[].linters' is undefined.",
        });

        rotten.checkers.length = 0;
        await assert.rejects(() => normalize(rotten, null, null, {}), {
            name:    "Error",
            message: "'checkers' is empty.",
        });

        rotten.checkers = 1;
        await assert.rejects(() => normalize(rotten, null, null, {}), {
            name:    "TypeError",
            message: "'checkers' is not an array.",
        });

        rotten.reporters = 1;
        await assert.rejects(() => normalize(rotten, null, null, {}), {
            name:    "TypeError",
            message: "'reporters' incorrect type.",
        });

        rotten.level = "APOCALYPSE";
        await assert.rejects(() => normalize(rotten, null, null, {}), {
            name:    "Error",
            message: "value of property 'level' is unknown (possibles values" +
                     " : 'off', 'fatal', 'error', 'warn' and 'info').",
        });

        rotten.level = 1;
        await assert.rejects(() => normalize(rotten, null, null, {}), {
            name:    "TypeError",
            message: "property 'level' is incorrect type (only string is" +
                     " accepted).",
        });

        rotten.patterns = 1;
        await assert.rejects(() => normalize(rotten, null, null, {}), {
            name:    "TypeError",
            message: "property 'patterns' is incorrect type (string and array" +
                     " are accepted).",
        });
    });
});
