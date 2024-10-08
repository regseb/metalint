/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as flatten from "../../../../src/core/configuration/flatten.js";
import ConsoleFormatter from "../../../../src/core/formatter/console.js";
import JSONFormatter from "../../../../src/core/formatter/json.js";
import Levels from "../../../../src/core/levels.js";
import ESLintWrapper from "../../../../src/core/wrapper/eslint.js";
import PrettierWrapper from "../../../../src/core/wrapper/prettier.js";

describe("src/core/configuration/flatten.js", () => {
    describe("flattenPatterns()", () => {
        it("should merge", () => {
            const flattened = flatten.flattenPatterns(["foo", "bar"], {
                patterns: ["baz", "qux"],
            });
            assert.deepEqual(flattened, ["baz", "qux", "foo", "bar"]);
        });
    });

    describe("flattenFix()", () => {
        it("should keep", () => {
            const flattened = flatten.flattenFix(true, { fix: false });
            assert.equal(flattened, true);
        });

        it("should override", () => {
            const flattened = flatten.flattenFix(undefined, { fix: false });
            assert.equal(flattened, false);
        });
    });

    describe("flattenLevel()", () => {
        it("should keep", () => {
            const flattened = flatten.flattenLevel(Levels.ERROR, {
                level: Levels.INFO,
            });
            assert.equal(flattened, Levels.ERROR);
        });

        it("should override", () => {
            const flattened = flatten.flattenLevel(undefined, {
                level: Levels.INFO,
            });
            assert.equal(flattened, Levels.INFO);
        });
    });

    describe("flattenOptions()", () => {
        it("should support one element", () => {
            const flattened = flatten.flattenOptions([{ foo: "bar" }], {
                options: { baz: "qux" },
            });
            assert.deepEqual(flattened, { baz: "qux", foo: "bar" });
        });

        it("should support many elements", () => {
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

    describe("flattenReporter()", () => {
        it("should flatten", () => {
            const flattened = flatten.flattenReporter(
                {
                    formatter: ConsoleFormatter,
                    level: undefined,
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

    describe("flattenReporters()", () => {
        it("should flatten", () => {
            const flattened = flatten.flattenReporters(
                [
                    {
                        formatter: ConsoleFormatter,
                        level: Levels.WARN,
                        options: [{}],
                    },
                ],
                { formatter: undefined, level: Levels.INFO },
            );
            assert.deepEqual(flattened, [
                {
                    formatter: ConsoleFormatter,
                    level: Levels.WARN,
                    options: {},
                },
            ]);
        });

        it("should flatten with argv", () => {
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

    describe("flattenLinter()", () => {
        it("should flatten", () => {
            const flattened = flatten.flattenLinter(
                {
                    wrapper: ESLintWrapper,
                    fix: false,
                    level: Levels.ERROR,
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
                level: Levels.ERROR,
                options: { foo: "bar", baz: "qux" },
            });
        });
    });

    describe("flattenLinters()", () => {
        it("should flatten", () => {
            const flattened = flatten.flattenLinters(
                [
                    {
                        wrapper: ESLintWrapper,
                        fix: false,
                        level: Levels.ERROR,
                        options: [{ curly: "warn" }],
                    },
                    {
                        wrapper: ESLintWrapper,
                        fix: true,
                        level: Levels.WARN,
                        options: [{ "no-undef": "error" }],
                    },
                    {
                        wrapper: PrettierWrapper,
                        fix: undefined,
                        level: undefined,
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
                    options: { curly: "warn", "no-undef": "error" },
                },
                {
                    wrapper: PrettierWrapper,
                    fix: false,
                    level: Levels.INFO,
                    options: {},
                },
            ]);
        });
    });

    describe("flattenOverride()", () => {
        it("should flatten", () => {
            const flattened = flatten.flattenOverride(
                {
                    patterns: ["*.mjs"],
                    fix: undefined,
                    level: Levels.ERROR,
                    linters: [
                        {
                            wrapper: ESLintWrapper,
                            fix: false,
                            level: undefined,
                            options: [{}],
                        },
                    ],
                },
                {
                    fix: true,
                    level: Levels.WARN,
                },
            );
            assert.deepEqual(flattened, {
                patterns: ["*.mjs"],
                linters: [
                    {
                        wrapper: ESLintWrapper,
                        fix: false,
                        level: Levels.ERROR,
                        options: {},
                    },
                ],
            });
        });
    });

    describe("flattenChecker()", () => {
        it("should flatten", () => {
            const flattened = flatten.flattenChecker(
                {
                    patterns: ["**.js"],
                    fix: true,
                    level: undefined,
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
                            patterns: ["**.min.js"],
                            fix: false,
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
                },
                {
                    fix: false,
                    level: Levels.ERROR,
                },
            );
            assert.deepEqual(flattened, {
                patterns: ["**.js"],
                linters: [
                    {
                        wrapper: PrettierWrapper,
                        fix: true,
                        level: Levels.ERROR,
                        options: {},
                    },
                ],
                overrides: [
                    {
                        patterns: ["**.min.js"],
                        linters: [
                            {
                                wrapper: ESLintWrapper,
                                fix: false,
                                level: Levels.ERROR,
                                options: {},
                            },
                        ],
                    },
                ],
            });
        });
    });

    describe("flatten()", () => {
        it("should use default", () => {
            const flattened = flatten.flatten(
                {
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
                    checkers: [
                        {
                            patterns: ["**.js"],
                            fix: undefined,
                            level: undefined,
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
                                    patterns: ["**.min.js"],
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
                        },
                    ],
                },
                {},
            );
            assert.deepEqual(flattened, {
                patterns: ["**"],
                reporters: [
                    {
                        formatter: ConsoleFormatter,
                        level: Levels.INFO,
                        options: {},
                    },
                ],
                checkers: [
                    {
                        patterns: ["**.js"],
                        linters: [
                            {
                                wrapper: PrettierWrapper,
                                fix: false,
                                level: Levels.INFO,
                                options: {},
                            },
                        ],
                        overrides: [
                            {
                                patterns: ["**.min.js"],
                                linters: [
                                    {
                                        wrapper: ESLintWrapper,
                                        fix: false,
                                        level: Levels.INFO,
                                        options: {},
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
        });

        it("should flatten", () => {
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
                    checkers: [
                        {
                            patterns: ["**.js"],
                            fix: undefined,
                            level: undefined,
                            linters: [
                                {
                                    wrapper: PrettierWrapper,
                                    fix: undefined,
                                    level: undefined,
                                    options: [{}],
                                },
                            ],
                            overrides: [],
                        },
                    ],
                },
                {},
            );
            assert.deepEqual(flattened, {
                patterns: ["*"],
                reporters: [
                    {
                        formatter: ConsoleFormatter,
                        level: Levels.INFO,
                        options: {},
                    },
                ],
                checkers: [
                    {
                        patterns: ["**.js"],
                        linters: [
                            {
                                wrapper: PrettierWrapper,
                                fix: true,
                                level: Levels.FATAL,
                                options: {},
                            },
                        ],
                        overrides: [],
                    },
                ],
            });
        });

        it("should use argv", () => {
            const flattened = flatten.flatten(
                {
                    patterns: ["*"],
                    fix: undefined,
                    level: undefined,
                    reporters: [],
                    checkers: [
                        {
                            patterns: ["**.md"],
                            fix: undefined,
                            level: undefined,
                            linters: [
                                {
                                    wrapper: PrettierWrapper,
                                    fix: undefined,
                                    level: undefined,
                                    options: [{}],
                                },
                            ],
                            overrides: [],
                        },
                    ],
                },
                { fix: true, level: Levels.WARN, formatter: ConsoleFormatter },
            );
            assert.deepEqual(flattened, {
                patterns: ["*"],
                reporters: [
                    {
                        formatter: ConsoleFormatter,
                        level: Levels.WARN,
                        options: {},
                    },
                ],
                checkers: [
                    {
                        patterns: ["**.md"],
                        linters: [
                            {
                                wrapper: PrettierWrapper,
                                fix: true,
                                level: Levels.WARN,
                                options: {},
                            },
                        ],
                        overrides: [],
                    },
                ],
            });
        });
    });
});
