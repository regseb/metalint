/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import * as flatten from "../../../../src/core/configuration/flatten.js";
import ConsoleFormatter from "../../../../src/core/formatter/console.js";
import JSONFormatter from "../../../../src/core/formatter/json.js";
import Levels from "../../../../src/core/levels.js";
import ESLintWrapper from "../../../../src/core/wrapper/eslint.js";
import PrettierWrapper from "../../../../src/core/wrapper/prettier.js";

describe("src/core/configuration/flatten.js", function () {
    describe("flattenPatterns()", function () {
        it("should merge", function () {
            const flattened = flatten.flattenPatterns(["foo", "bar"], {
                patterns: ["baz", "qux"],
            });
            assert.deepEqual(flattened, ["baz", "qux", "foo", "bar"]);
        });
    });

    describe("flattenFix()", function () {
        it("should support undefined and boolean", function () {
            const flattened = flatten.flattenFix(undefined, { fix: false });
            assert.equal(flattened, false);
        });

        it("should support two boolean", function () {
            const flattened = flatten.flattenFix(true, { fix: false });
            assert.equal(flattened, true);
        });
    });

    describe("flattenLevel()", function () {
        it("should keep", function () {
            const flattened = flatten.flattenLevel(Levels.ERROR, {
                level: Levels.INFO,
            });
            assert.equal(flattened, Levels.ERROR);
        });

        it("should override", function () {
            const flattened = flatten.flattenLevel(Levels.WARN, {
                level: Levels.OFF,
            });
            assert.equal(flattened, Levels.OFF);
        });
    });

    describe("flattenOptions()", function () {
        it("should support one element", function () {
            const flattened = flatten.flattenOptions([{ foo: "bar" }], {
                options: { baz: "qux" },
            });
            assert.deepEqual(flattened, { baz: "qux", foo: "bar" });
        });

        it("should support many elements", function () {
            const flattened = flatten.flattenOptions(
                [
                    {
                        foo: 1,
                        bar: 2,
                    },
                    {
                        foo: 3,
                        baz: 4,
                    },
                ],
                { options: {} },
            );
            assert.deepEqual(flattened, { foo: 3, bar: 2, baz: 4 });
        });
    });

    describe("flattenReporter()", function () {
        it("should flatten", function () {
            const flattened = flatten.flattenReporter(
                {
                    formatter: ConsoleFormatter,
                    level: Levels.INFO,
                    options: [{}],
                },
                { level: Levels.WARN },
            );
            assert.deepEqual(flattened, {
                formatter: ConsoleFormatter,
                level: Levels.WARN,
                options: {},
            });
        });
    });

    describe("flattenReporters()", function () {
        it("should flatten", function () {
            const flattened = flatten.flattenReporters(
                [
                    {
                        formatter: ConsoleFormatter,
                        level: Levels.INFO,
                        options: [{}],
                    },
                ],
                { formatter: undefined, level: Levels.WARN },
            );
            assert.deepEqual(flattened, [
                {
                    formatter: ConsoleFormatter,
                    level: Levels.WARN,
                    options: {},
                },
            ]);
        });

        it("should flatten with argv", function () {
            const flattened = flatten.flattenReporters(
                [
                    {
                        formatter: JSONFormatter,
                        level: Levels.ERROR,
                        options: [{}],
                    },
                ],
                { formatter: ConsoleFormatter, level: Levels.WARN },
            );
            assert.deepEqual(flattened, [
                {
                    formatter: ConsoleFormatter,
                    level: Levels.WARN,
                    options: {},
                },
            ]);
        });
    });

    describe("flattenLinter()", function () {
        it("should flatten", function () {
            const flattened = flatten.flattenLinter(
                {
                    wrapper: ESLintWrapper,
                    fix: false,
                    level: Levels.INFO,
                    options: [{ foo: "bar" }],
                },
                {
                    fix: true,
                    level: Levels.WARN,
                    options: { baz: "qux" },
                },
            );
            assert.deepEqual(flattened, {
                wrapper: ESLintWrapper,
                fix: false,
                level: Levels.WARN,
                options: { foo: "bar", baz: "qux" },
            });
        });
    });

    describe("flattenLinters()", function () {
        it("should flattened", function () {
            const flattened = flatten.flattenLinters(
                [
                    {
                        wrapper: ESLintWrapper,
                        fix: true,
                        level: Levels.WARN,
                        options: [{}],
                    },
                ],
                { fix: false, level: Levels.INFO },
            );
            assert.deepEqual(flattened, [
                {
                    wrapper: ESLintWrapper,
                    fix: true,
                    level: Levels.WARN,
                    options: {},
                },
            ]);
        });
    });

    describe("flattenChecker()", function () {
        it("should flatten", function () {
            const flattened = flatten.flattenChecker(
                {
                    patterns: ["foo"],
                    fix: true,
                    level: Levels.WARN,
                    linters: [
                        {
                            wrapper: PrettierWrapper,
                            fix: undefined,
                            level: Levels.INFO,
                            options: [{}],
                        },
                    ],
                    overrides: [],
                },
                {
                    fix: false,
                    level: Levels.INFO,
                },
            );
            assert.deepEqual(flattened, {
                patterns: ["foo"],
                linters: [
                    {
                        wrapper: PrettierWrapper,
                        fix: true,
                        level: Levels.WARN,
                        options: {},
                    },
                ],
                overrides: [],
            });
        });
    });

    describe("flatten()", function () {
        it("should flatten", function () {
            const flattened = flatten.flatten(
                {
                    patterns: ["*"],
                    fix: true,
                    level: Levels.FATAL,
                    reporters: [
                        {
                            formatter: ConsoleFormatter,
                            level: Levels.INFO,
                            options: [{}],
                        },
                    ],
                    checkers: [],
                },
                {},
            );
            assert.deepEqual(flattened, {
                patterns: ["*"],
                reporters: [
                    {
                        formatter: ConsoleFormatter,
                        level: Levels.FATAL,
                        options: {},
                    },
                ],
                checkers: [],
            });
        });
    });
});
