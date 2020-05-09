"use strict";

const assert    = require("assert");
const fs        = require("fs");
const path      = require("path");
const normalize = require("../../lib/normalize");
const SEVERITY  = require("../../lib/severity");
const Console   = require("../../lib/formatter/console");
const Unix      = require("../../lib/formatter/unix");
const French    = require("../data/formatter/french");

describe("lib/normalize.js", function () {
    it("", function () {
        const rotten = { checkers: [{ linters: { eslint: {} } }] };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = normalize(rotten, root, dir, {});

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

    it("", function () {
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
                            "eslint.json",
                            { rules: { curly: 1, "no-var": 2 } },
                        ],
                    },
                }, {
                    linters: ["htmllint", "htmlhint"],
                }, {
                    linters: { csslint: "csslintrc" },
                },
            ],
        };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = normalize(rotten, root, dir, {});

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

    it("patterns()", function () {
        const rotten = { checkers: [{ linters: { eslint: {} } }] };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const overwriting = { patterns: ["*.js"] };
        const standard = normalize(rotten, root, dir, overwriting);

        assert.deepStrictEqual(standard.patterns, ["*.js"]);
    });

    it("patterns()", function () {
        const rotten = {
            patterns: "*.html",
            checkers: [{ linters: { eslint: {} } }],
        };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const overwriting = { patterns: ["src/**/*.css"] };
        const standard = normalize(rotten, root, dir, overwriting);

        assert.deepStrictEqual(standard.patterns, ["src/**/*.css"]);
    });

    it("level()", function () {
        const rotten = { checkers: [{ linters: { eslint: {} } }] };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const overwriting = { level: "error" };
        const standard = normalize(rotten, root, dir, overwriting);

        assert.strictEqual(standard.level, SEVERITY.ERROR);
    });

    it("level()", function () {
        const rotten = {
            level:    "error",
            checkers: [{ linters: { eslint: {} } }],
        };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const overwriting = { level: "warn" };
        const standard = normalize(rotten, root, dir, overwriting);

        assert.strictEqual(standard.level, SEVERITY.WARN);
    });

    it("formatter()", function () {
        const rotten = {
            reporter: {},
            checkers: [{ linters: { eslint: {} } }],
        };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const overwriting = { formatter: "unix" };
        const standard = normalize(rotten, root, dir, overwriting);

        assert.deepStrictEqual(standard.reporters,
                               [new Unix(SEVERITY.INFO, process.stdout, {})]);
    });

    it("formatter()", function () {
        const rotten = {
            level:    "error",
            reporter: { formatter: "console" },
            checkers: [{ linters: { eslint: {} } }],
        };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const overwriting = { formatter: "unix" };
        const standard = normalize(rotten, root, dir, overwriting);

        assert.deepStrictEqual(standard.reporters,
                               [new Unix(SEVERITY.ERROR, process.stdout, {})]);
    });

    it("formatter()", function () {
        const rotten = { reporters: { formatter: false } };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");

        assert.throws(() => normalize(rotten, root, dir, {}), {
            name:    "TypeError",
            message: "property 'formatter' is incorrect type (only string is" +
                     " accepted).",
        });
    });

    it("output()", function () {
        const rotten = {
            reporter: {},
            checkers: [{ linters: { eslint: {} } }],
        };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const overwriting = { output: "./output.test" };
        const standard = normalize(rotten, root, dir, overwriting);

        assert.notStrictEqual(standard.reporters[0].writer, process.stdout);
        fs.unlinkSync(path.join(root, overwriting.output));
    });

    it("output()", function () {
        const rotten = { reporters: { output: "/output.log" } };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");

        assert.throws(() => normalize(rotten, root, dir, {}), {
            name:    "Error",
            message: "permission denied to open output file '/output.log'.",
        });
    });

    it("output()", function () {
        const rotten = { reporters: { output: "./not_exist/output.log" } };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");

        assert.throws(() => normalize(rotten, root, dir, {}), {
            name:    "Error",
            message: "permission denied to open output file" +
                     " './not_exist/output.log'.",
        });
    });

    it("output()", function () {
        const rotten = { reporters: { output: false } };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");

        assert.throws(() => normalize(rotten, root, dir, {}), {
            name:    "TypeError",
            message: "property 'output' is incorrect type (only string is" +
                     " accepted).",
        });
    });

    it("options()", function () {
        const rotten = {
            reporters: { options: { showZeroNotice: true } },
            checkers:  [{ linters: { markdownlint: null } }],
        };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = normalize(rotten, root, dir, {});

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

    it("options()", function () {
        const rotten = { reporters: { options: false } };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");

        assert.throws(() => normalize(rotten, root, dir, {}), {
            name:    "TypeError",
            message: "property 'options' is incorrect type (only object is" +
                     " accepted).",
        });
    });

    it("reporters()", function () {
        const rotten = {
            checkers: [{ linters: { markdownlint: null } }],
        };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = normalize(rotten, root, dir, {});

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

    it("reporters()", function () {
        const rotten = {
            reporters: [],
            checkers:  [{ linters: { markdownlint: null } }],
        };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = normalize(rotten, root, dir, {});

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

    it("reporters()", function () {
        const rotten = {
            reporters: {},
            checkers:  [{ linters: { markdownlint: null } }],
        };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = normalize(rotten, root, dir, {});

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

    it("reporters()", function () {
        const rotten = {
            reporters: [{}],
            checkers:  [{ linters: { markdownlint: null } }],
        };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = normalize(rotten, root, dir, {});

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

    it("reporters()", function () {
        const rotten = {
            checkers:  [{ linters: { markdownlint: null } }],
        };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = normalize(rotten, root, dir, { formatter: "unix" });

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

    it("reporters()", function () {
        const rotten = {
            reporters: [],
            checkers:  [{ linters: { markdownlint: null } }],
        };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = normalize(rotten, root, dir, { formatter: "unix" });

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

    it("reporters()", function () {
        const rotten = {
            reporters: [{}],
            checkers:  [{ linters: { markdownlint: null } }],
        };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = normalize(rotten, root, dir, { formatter: "unix" });

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

    it("reporters()", function () {
        const rotten = {
            reporters: {},
            checkers:  [{ linters: { markdownlint: null } }],
        };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = normalize(rotten, root, dir, { formatter: "unix" });

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

    it("merge()", function () {
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
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = normalize(rotten, root, dir, {});

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
                            plugins: ["foo", "bar", "baz"],
                            global:  "bar",
                            rules:   { bar: "baz" },
                        },
                    },
                },
            ],
        });
    });

    it("", function () {
        const rotten = {
            checkers: [
                {
                    linters: "jsonlint",
                },
            ],
        };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        assert.throws(() => normalize(rotten, root, dir, {}), {
            name:    "Error",
            message: path.join(__dirname, "../data/.metalint/jsonlint.json") +
                     ": Parse error on line 1:\n" +
                     "<xml></xml>\n" +
                     "^\n" +
                     "Expecting 'STRING', 'NUMBER', 'NULL', 'TRUE', 'FALSE'," +
                     " '{', '[', got 'undefined'",
        });
    });

    it("", function () {
        const rotten = {
            reporters: { formatter: "./formatter/french" },
            checkers:  [{ linters: { eslint: {} } }],
        };
        const root = path.join(__dirname, "../data/");
        const standard = normalize(rotten, root, null, {});
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

    it("", function () {
        const rotten = { checkers: [{ linters: { jsonlint: [1] } }] };
        assert.throws(() => normalize(rotten, null, null, {}), {
            name:    "TypeError",
            message: "linter option incorrect type.",
        });

        rotten.checkers[0].linters.jsonlint[0] = null;
        assert.throws(() => normalize(rotten, null, null, {}), {
            name:    "Error",
            message: "linter option is null.",
        });

        rotten.checkers[0].linters.jsonlint = 1;
        assert.throws(() => normalize(rotten, null, null, {}), {
            name:    "TypeError",
            message: "linter incorrect type.",
        });

        rotten.checkers[0].linters = 1;
        assert.throws(() => normalize(rotten, null, null, {}), {
            name:    "TypeError",
            message: "'checkers[].linters' incorrect type.",
        });

        rotten.checkers[0].linters = null;
        assert.throws(() => normalize(rotten, null, null, {}), {
            name:    "Error",
            message: "'checkers[].linters' is null.",
        });

        Reflect.deleteProperty(rotten.checkers[0], "linters");
        assert.throws(() => normalize(rotten, null, null, {}), {
            name:    "Error",
            message: "'checkers[].linters' is undefined.",
        });

        rotten.checkers.length = 0;
        assert.throws(() => normalize(rotten, null, null, {}), {
            name:    "Error",
            message: "'checkers' is empty.",
        });

        rotten.checkers = 1;
        assert.throws(() => normalize(rotten, null, null, {}), {
            name:    "TypeError",
            message: "'checkers' is not an array.",
        });

        rotten.reporters = 1;
        assert.throws(() => normalize(rotten, null, null, {}), {
            name:    "TypeError",
            message: "'reporters' incorrect type.",
        });

        rotten.level = "APOCALYPSE";
        assert.throws(() => normalize(rotten, null, null, {}), {
            name:    "Error",
            message: "value of property 'level' is unknown (possibles values" +
                     " : 'off', 'fatal', 'error', 'warn' and 'info').",
        });

        rotten.level = 1;
        assert.throws(() => normalize(rotten, null, null, {}), {
            name:    "TypeError",
            message: "property 'level' is incorrect type (only string is" +
                     " accepted).",
        });

        rotten.patterns = 1;
        assert.throws(() => normalize(rotten, null, null, {}), {
            name:    "TypeError",
            message: "property 'patterns' is incorrect type (string and array" +
                     " are accepted).",
        });
    });
});
