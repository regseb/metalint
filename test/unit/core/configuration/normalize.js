/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import * as normalize from "../../../../src/core/configuration/normalize.js";
import ConsoleFormatter from "../../../../src/core/formatter/console.js";
import Formatter from "../../../../src/core/formatter/formatter.js";
import JSONFormatter from "../../../../src/core/formatter/json.js";
import UnixFormatter from "../../../../src/core/formatter/unix.js";
import Levels from "../../../../src/core/levels.js";
import ESLintWrapper from "../../../../src/core/wrapper/eslint.js";
import PrantlfJSONLintWrapper from "../../../../src/core/wrapper/prantlf__jsonlint.js";
import PrettierWrapper from "../../../../src/core/wrapper/prettier.js";
import StandardWrapper from "../../../../src/core/wrapper/standard.js";
import Wrapper from "../../../../src/core/wrapper/wrapper.js";
import YAMLLintWrapper from "../../../../src/core/wrapper/yaml-lint.js";

describe("src/core/configuration/normalize.js", () => {
    describe("normalizePatterns()", () => {
        it("should reject undefined", () => {
            assert.throws(() => normalize.normalizePatterns(undefined), {
                name: "Error",
                message: "Property 'patterns' is required.",
            });
        });

        it("should support string", () => {
            const normalized = normalize.normalizePatterns("foo");
            assert.deepEqual(normalized, ["foo"]);
        });

        it("should support array of strings", () => {
            const normalized = normalize.normalizePatterns(["foo", "bar"]);
            assert.deepEqual(normalized, ["foo", "bar"]);
        });

        it("should reject array of non-strings", () => {
            assert.throws(() => normalize.normalizePatterns(["foo", true]), {
                name: "TypeError",
                message:
                    "Property 'patterns' is incorrect type (string and" +
                    " array of strings are accepted).",
            });
        });

        it("should reject non-array and non-strings", () => {
            assert.throws(() => normalize.normalizePatterns(true), {
                name: "TypeError",
                message:
                    "Property 'patterns' is incorrect type (string and" +
                    " array of strings are accepted).",
            });
        });
    });

    describe("normalizeFix()", () => {
        it("should use default", () => {
            const normalized = normalize.normalizeFix(undefined);
            assert.equal(normalized, undefined);
        });

        it("should support boolean", () => {
            const normalized = normalize.normalizeFix(true);
            assert.equal(normalized, true);
        });

        it("should reject non-boolean", () => {
            assert.throws(() => normalize.normalizeFix("foo"), {
                name: "TypeError",
                message:
                    "Property 'fix' is incorrect type (only boolean is" +
                    " accepted).",
            });
        });
    });

    describe("normalizeLevel()", () => {
        it("should use default", () => {
            const normalized = normalize.normalizeLevel(undefined);
            assert.equal(normalized, undefined);
        });

        it("should support string", () => {
            const normalized = normalize.normalizeLevel("warn");
            assert.equal(normalized, Levels.WARN);
        });

        it("should support string in uppercase", () => {
            const normalized = normalize.normalizeLevel("ERROR");
            assert.equal(normalized, Levels.ERROR);
        });

        it("should reject unknown string", () => {
            assert.throws(() => normalize.normalizeLevel("foo"), {
                name: "Error",
                message:
                    "Value of property 'level' is unknown (possibles" +
                    " values: 'off', 'fatal', 'error', 'warn' and" +
                    " 'info').",
            });
        });

        it("should support number", () => {
            const normalized = normalize.normalizeLevel(1);
            assert.equal(normalized, Levels.FATAL);
        });

        it("should reject unknown number", () => {
            assert.throws(() => normalize.normalizeLevel(42), {
                name: "Error",
                message:
                    "Value of property 'level' is unknown (possibles" +
                    " values: Levels.OFF, Levels.FATAL, Levels.ERROR," +
                    " Levels.WARN and Levels.INFO).",
            });
        });

        it("should reject non-string and non-number", () => {
            assert.throws(() => normalize.normalizeLevel(true), {
                name: "TypeError",
                message:
                    "Property 'level' is incorrect type (only string" +
                    " and number is accepted).",
            });
        });
    });

    describe("normalizeFormatter()", () => {
        it("should use default", async () => {
            const normalized = await normalize.normalizeFormatter(undefined);
            assert.equal(normalized, ConsoleFormatter);
        });

        it("should support string", async () => {
            const normalized = await normalize.normalizeFormatter("unix");
            assert.equal(normalized, UnixFormatter);
        });

        it("should support string in uppercase", async () => {
            const normalized = await normalize.normalizeFormatter("JSON");
            assert.equal(normalized, JSONFormatter);
        });

        it("should reject unknown string", async () => {
            await assert.rejects(() => normalize.normalizeFormatter("foo"), {
                name: "Error",
                message:
                    "Value of property 'formatter' is unknown (possibles" +
                    ' values: "checkstyle", "console", "csv", "github",' +
                    ' "json", "unix").',
            });
        });

        it("should support Formatter", async () => {
            const MyFormatter = class extends Formatter {};
            const normalized = await normalize.normalizeFormatter(MyFormatter);
            assert.equal(normalized, MyFormatter);
        });

        it("should reject non-string and non-Formatter", async () => {
            await assert.rejects(() => normalize.normalizeFormatter(true), {
                name: "TypeError",
                message:
                    "Property 'formatter' is incorrect type (only string is" +
                    " accepted).",
            });
        });
    });

    describe("normalizeOption()", () => {
        it("should support string", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeOption(
                "./markdownlint.config.js",
                {
                    dir,
                },
            );
            assert.deepEqual(normalized["heading-increment"], true);
        });

        it("should reject when no file", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            await assert.rejects(
                () => normalize.normalizeOption("./jshint.config.js", { dir }),
                (err) => {
                    assert.equal(err.name, "Error");
                    assert.equal(
                        err.message,
                        `Cannot import '${path.join(dir, "./jshint.config.js")}'.`,
                    );
                    assert.ok(err.cause instanceof Error);
                    return true;
                },
            );
        });

        it("should support Object", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeOption(
                { foo: "bar" },
                { dir },
            );
            assert.deepEqual(normalized, { foo: "bar" });
        });

        it("should reject non-string and non-Object", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            await assert.rejects(
                () => normalize.normalizeOption(true, { dir }),
                {
                    name: "TypeError",
                    message:
                        "One of 'options' is incorrect type (only object is" +
                        " accepted).",
                },
            );
        });
    });

    describe("normalizeOptions()", () => {
        it("should use default", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeOptions(undefined, {
                dir,
            });
            assert.deepEqual(normalized, [{}]);
        });

        it("should support Array", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeOptions(
                ["./markdownlint.config.js"],
                {
                    dir,
                },
            );
            assert.deepEqual(normalized[0]["heading-increment"], true);
        });

        it("should support string", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeOptions(
                "./markdownlint.config.js",
                {
                    dir,
                },
            );
            assert.deepEqual(normalized[0]["heading-increment"], true);
        });

        it("should support Object", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeOptions(
                { foo: "bar" },
                { dir },
            );
            assert.deepEqual(normalized, [{ foo: "bar" }]);
        });

        it("should reject non-string and non-Object", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            await assert.rejects(
                () => normalize.normalizeOptions(true, { dir }),
                {
                    name: "TypeError",
                    message: "'options' incorrect type.",
                },
            );
        });
    });

    describe("normalizeReporter()", () => {
        it("should use default", async () => {
            const dir = ".";
            const normalized = await normalize.normalizeReporter({}, { dir });
            assert.deepEqual(normalized, {
                formatter: ConsoleFormatter,
                level: undefined,
                options: [{}],
            });
        });

        it("should support Object", async () => {
            const dir = ".";
            const normalized = await normalize.normalizeReporter(
                {
                    formatter: "unix",
                    level: Levels.ERROR,
                    options: [{ foo: "bar" }],
                },
                { dir },
            );
            assert.deepEqual(normalized, {
                formatter: UnixFormatter,
                level: Levels.ERROR,
                options: [{ foo: "bar" }],
            });
        });

        it("should reject non-Object", async () => {
            const dir = ".";
            await assert.rejects(
                () => normalize.normalizeReporter("foo", { dir }),
                {
                    name: "TypeError",
                    message: "One of 'reporters' incorrect type.",
                },
            );
        });
    });

    describe("normalizeReporters()", () => {
        it("should use default", async () => {
            const dir = ".";
            const normalized = await normalize.normalizeReporters(undefined, {
                dir,
            });
            assert.deepEqual(normalized, [
                {
                    formatter: ConsoleFormatter,
                    level: undefined,
                    options: [{}],
                },
            ]);
        });

        it("should support Array", async () => {
            const dir = ".";
            const normalized = await normalize.normalizeReporters(
                [
                    {
                        formatter: "unix",
                    },
                    { level: Levels.FATAL },
                ],
                { dir },
            );
            assert.deepEqual(normalized, [
                {
                    formatter: UnixFormatter,
                    level: undefined,
                    options: [{}],
                },
                {
                    formatter: ConsoleFormatter,
                    level: Levels.FATAL,
                    options: [{}],
                },
            ]);
        });

        it("should support Object", async () => {
            const dir = ".";
            const normalized = await normalize.normalizeReporters(
                {
                    formatter: "json",
                    level: Levels.WARN,
                    options: [{ indent: 2 }],
                },
                { dir },
            );
            assert.deepEqual(normalized, [
                {
                    formatter: JSONFormatter,
                    level: Levels.WARN,
                    options: [{ indent: 2 }],
                },
            ]);
        });

        it("should reject non-Array and non-Object", async () => {
            const dir = ".";
            await assert.rejects(
                () => normalize.normalizeReporters("foo", { dir }),
                {
                    name: "TypeError",
                    message: "'reporters' incorrect type.",
                },
            );
        });
    });

    describe("normalizeWrapper()", () => {
        it("should support string", async () => {
            const normalized = await normalize.normalizeWrapper("eslint");
            assert.equal(normalized, ESLintWrapper);
        });

        it("should support string in uppercase", async () => {
            const normalized = await normalize.normalizeWrapper("YAML-Lint");
            assert.equal(normalized, YAMLLintWrapper);
        });

        it("should reject unknown string", async () => {
            await assert.rejects(() => normalize.normalizeWrapper("foo"), {
                name: "Error",
                message:
                    "Value of property 'wrapper' is unknown (possibles" +
                    ' values: "addons-linter", "ajv", "coffeelint__cli",' +
                    ' "depcheck", "doiuse", "eslint", "htmlhint", "htmllint",' +
                    ' "jshint", "jsonlint-mod",' +
                    ' "mapbox__jsonlint-lines-primitives", "markdownlint",' +
                    ' "markuplint", "npm-check-updates",' +
                    ' "npm-package-json-lint", "prantlf__jsonlint",' +
                    ' "prettier", "publint", "purgecss", "secretlint",' +
                    ' "sort-package-json", "standard", "stylelint",' +
                    ' "svglint", "yaml-lint").',
            });
        });

        it("should support Wrapper", async () => {
            const MyWrapper = class extends Wrapper {};
            const normalized = await normalize.normalizeWrapper(MyWrapper);
            assert.equal(normalized, MyWrapper);
        });

        it("should reject non-string and non-Wrapper", async () => {
            await assert.rejects(() => normalize.normalizeWrapper(true), {
                name: "TypeError",
                message:
                    "Property 'wrapper' is incorrect type (only string is" +
                    " accepted).",
            });
        });
    });

    describe("normalizeLinter()", () => {
        it("should support string", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeLinter(
                "prantlf__jsonlint",
                {
                    dir,
                },
            );
            assert.deepEqual(normalized, {
                wrapper: PrantlfJSONLintWrapper,
                fix: undefined,
                level: undefined,
                options: [{ allowDuplicateObjectKeys: false }],
            });
        });

        it("should support string with underscore", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeLinter("eslint_bin", {
                dir,
            });
            assert.deepEqual(normalized, {
                wrapper: ESLintWrapper,
                fix: undefined,
                level: undefined,
                options: [{ rules: { "n/no-process-exit": "off" } }],
            });
        });

        it("should support string for linter non-configurable", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeLinter("standard", {
                dir,
            });
            assert.deepEqual(normalized, {
                wrapper: StandardWrapper,
                fix: undefined,
                level: undefined,
                options: [{}],
            });
        });

        it("should reject string with underscore for linter non-configurable", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            await assert.rejects(
                () =>
                    normalize.normalizeLinter(
                        "mapbox__jsonlint-lines-primitives_foo",
                        { dir },
                    ),
                {
                    name: "Error",
                    message:
                        "'mapbox__jsonlint-lines-primitives_foo' isn't" +
                        " configurable.",
                },
            );
        });

        it("should support Object", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeLinter(
                {
                    wrapper: "yaml-lint",
                    fix: true,
                    level: "warn",
                    options: { foo: "bar" },
                },
                { dir },
            );
            assert.deepEqual(normalized, {
                wrapper: YAMLLintWrapper,
                fix: true,
                level: Levels.WARN,
                options: [{ foo: "bar" }],
            });
        });

        it("should reject non-string and non-Object", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            await assert.rejects(
                () => normalize.normalizeLinter(true, { dir }),
                {
                    name: "TypeError",
                    message: "One of 'linters' incorrect type.",
                },
            );
        });
    });

    describe("normalizeLinters()", () => {
        it("should use default", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeLinters(undefined, {
                dir,
            });
            assert.deepEqual(normalized, []);
        });

        it("should support Array", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeLinters(
                [
                    {
                        wrapper: "yaml-lint",
                        fix: true,
                        level: "warn",
                        options: { foo: "bar" },
                    },
                ],
                { dir },
            );
            assert.deepEqual(normalized, [
                {
                    wrapper: YAMLLintWrapper,
                    fix: true,
                    level: Levels.WARN,
                    options: [{ foo: "bar" }],
                },
            ]);
        });

        it("should support string", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeLinters("yaml-lint", {
                dir,
            });
            assert.deepEqual(normalized, [
                {
                    wrapper: YAMLLintWrapper,
                    fix: undefined,
                    level: undefined,
                    options: [{}],
                },
            ]);
        });

        it("should support Object", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeLinters(
                {
                    wrapper: "yaml-lint",
                    fix: true,
                    level: "warn",
                    options: { foo: "bar" },
                },
                { dir },
            );
            assert.deepEqual(normalized, [
                {
                    wrapper: YAMLLintWrapper,
                    fix: true,
                    level: Levels.WARN,
                    options: [{ foo: "bar" }],
                },
            ]);
        });

        it("should reject non-Array, non-string and non-Object", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            await assert.rejects(
                () => normalize.normalizeLinters(true, { dir }),
                {
                    name: "TypeError",
                    message: "'linters' incorrect type.",
                },
            );
        });
    });

    describe("normalizeOverride()", () => {
        it("should support Object", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeOverride(
                {
                    patterns: "*.js",
                    linters: { wrapper: "eslint" },
                },
                { dir },
            );
            assert.deepEqual(normalized, {
                patterns: ["*.js"],
                fix: undefined,
                level: undefined,
                linters: [
                    {
                        wrapper: ESLintWrapper,
                        fix: undefined,
                        level: undefined,
                        options: [{}],
                    },
                ],
            });
        });

        it("should reject non-Object", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            await assert.rejects(
                () => normalize.normalizeOverride(true, { dir }),
                {
                    name: "TypeError",
                    message: "One of 'overrides' incorrect type.",
                },
            );
        });
    });

    describe("normalizeOverrides()", () => {
        it("should use default", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeOverrides(undefined, {
                dir,
            });
            assert.deepEqual(normalized, []);
        });

        it("should support Array", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeOverrides(
                [
                    {
                        patterns: "*.yml",
                        fix: true,
                        level: "warn",
                        linters: {
                            wrapper: "yaml-lint",
                            options: { foo: "bar" },
                        },
                    },
                ],
                { dir },
            );
            assert.deepEqual(normalized, [
                {
                    patterns: ["*.yml"],
                    fix: true,
                    level: Levels.WARN,
                    linters: [
                        {
                            wrapper: YAMLLintWrapper,
                            fix: undefined,
                            level: undefined,
                            options: [{ foo: "bar" }],
                        },
                    ],
                },
            ]);
        });

        it("should support Object", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeOverrides(
                {
                    patterns: "*.yml",
                    fix: true,
                    level: "warn",
                    linters: [
                        {
                            wrapper: "yaml-lint",
                            options: { foo: "bar" },
                        },
                    ],
                },
                { dir },
            );
            assert.deepEqual(normalized, [
                {
                    patterns: ["*.yml"],
                    fix: true,
                    level: Levels.WARN,
                    linters: [
                        {
                            wrapper: YAMLLintWrapper,
                            fix: undefined,
                            level: undefined,
                            options: [{ foo: "bar" }],
                        },
                    ],
                },
            ]);
        });

        it("should reject non-Array and non-Object", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            await assert.rejects(
                () => normalize.normalizeOverrides(true, { dir }),
                {
                    name: "TypeError",
                    message: "'overrides' is incorrect type.",
                },
            );
        });
    });

    describe("normalizeChecker()", () => {
        it("should support Object", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeChecker(
                {
                    patterns: "*",
                    fix: true,
                    level: "fatal",
                    linters: { wrapper: "prettier" },
                    overrides: {
                        patterns: "*.js",
                        linters: { wrapper: "eslint" },
                    },
                },
                { dir },
            );
            assert.deepEqual(normalized, {
                patterns: ["*"],
                fix: true,
                level: Levels.FATAL,
                linters: [
                    {
                        wrapper: PrettierWrapper,
                        fix: undefined,
                        level: undefined,
                        options: [{}],
                    },
                ],
                overrides: [
                    {
                        patterns: ["*.js"],
                        fix: undefined,
                        level: undefined,
                        linters: [
                            {
                                wrapper: ESLintWrapper,
                                fix: undefined,
                                level: undefined,
                                options: [{}],
                            },
                        ],
                    },
                ],
            });
        });

        it("should reject non-Object", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            await assert.rejects(
                () => normalize.normalizeChecker(true, { dir }),
                {
                    name: "TypeError",
                    message: "One of 'checkers' incorrect type.",
                },
            );
        });
    });

    describe("normalizeCheckers()", () => {
        it("should use default", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeCheckers(undefined, {
                dir,
            });
            assert.deepEqual(normalized, []);
        });

        it("should support Array", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeCheckers(
                [
                    {
                        patterns: "*.yaml",
                        fix: true,
                        level: "warn",
                        linters: {
                            wrapper: "yaml-lint",
                            options: { foo: "bar" },
                        },
                    },
                ],
                { dir },
            );
            assert.deepEqual(normalized, [
                {
                    patterns: ["*.yaml"],
                    fix: true,
                    level: Levels.WARN,
                    linters: [
                        {
                            wrapper: YAMLLintWrapper,
                            fix: undefined,
                            level: undefined,
                            options: [{ foo: "bar" }],
                        },
                    ],
                    overrides: [],
                },
            ]);
        });

        it("should support Object", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalizeCheckers(
                {
                    patterns: ["*.yml", "*.yaml"],
                    fix: true,
                    level: "warn",
                    linters: [
                        {
                            wrapper: "yaml-lint",
                            options: { foo: "bar" },
                        },
                    ],
                },
                { dir },
            );
            assert.deepEqual(normalized, [
                {
                    patterns: ["*.yml", "*.yaml"],
                    fix: true,
                    level: Levels.WARN,
                    linters: [
                        {
                            wrapper: YAMLLintWrapper,
                            fix: undefined,
                            level: undefined,
                            options: [{ foo: "bar" }],
                        },
                    ],
                    overrides: [],
                },
            ]);
        });

        it("should reject non-Array and non-Object", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            await assert.rejects(
                () => normalize.normalizeCheckers(true, { dir }),
                {
                    name: "TypeError",
                    message: "'checkers' is incorrect type.",
                },
            );
        });
    });

    describe("normalize()", () => {
        it("should support Object", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalize(
                {
                    patterns: "*",
                    fix: true,
                    level: "fatal",
                    checkers: [],
                },
                { dir },
            );
            assert.deepEqual(normalized, {
                patterns: ["*"],
                fix: true,
                level: Levels.FATAL,
                reporters: [
                    {
                        formatter: ConsoleFormatter,
                        level: undefined,
                        options: [{}],
                    },
                ],
                checkers: [],
            });
        });

        it("should use default", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            const normalized = await normalize.normalize(
                {
                    patterns: ["**"],
                },
                { dir },
            );
            assert.deepEqual(normalized, {
                patterns: ["**"],
                fix: undefined,
                level: undefined,
                reporters: [
                    {
                        formatter: ConsoleFormatter,
                        level: undefined,
                        options: [{}],
                    },
                ],
                checkers: [],
            });
        });

        it("should reject non-Object", async () => {
            const dir = fileURLToPath(
                import.meta.resolve("../../../../.metalint/"),
            );
            await assert.rejects(() => normalize.normalize(true, { dir }), {
                name: "TypeError",
                message: "Configuration should be an object.",
            });
        });
    });
});
