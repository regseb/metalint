/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

export default {
    patterns: [
        "!/.git/",
        "!/CHANGELOG.md",
        "!/jsdocs/",
        "!/node_modules/",
        "!/.stryker/",
        "!/types/",
        "!*.swp",
        "**",
    ],
    checkers: [
        {
            patterns: ["*.json", "*.md", "*.svg", "*.yml"],
            linters: "prettier",
        },
        {
            patterns: ["*.js", "*.ts"],
            linters: {
                prettier: ["prettier.config.js", { tabWidth: 4 }],
            },
        },
        {
            patterns: "/src/core/**/*.js",
            linters: {
                eslint: ["eslint.config.js", "eslint_node.config.js"],
            },
        },
        {
            patterns: "/src/bin/**/*.js",
            linters: {
                eslint: [
                    "eslint.config.js",
                    "eslint_node.config.js",
                    "eslint_nodebin.config.js",
                ],
            },
        },
        {
            patterns: "/.script/**/*.js",
            linters: {
                eslint: ["eslint.config.js", "eslint_node.config.js"],
            },
        },
        {
            patterns: "/test/**/*.js",
            linters: {
                eslint: [
                    "eslint.config.js",
                    "eslint_node.config.js",
                    "eslint_test.config.js",
                ],
            },
        },
        {
            patterns: "*.config.js",
            linters: {
                eslint: ["eslint.config.js", "eslint_config.config.js"],
            },
        },
        {
            patterns: "*.md",
            linters: "markdownlint",
        },
        {
            patterns: "*.json",
            linters: { "jsonlint-mod": null },
        },
        {
            patterns: "/package.json",
            linters: "npm-package-json-lint",
        },
        {
            patterns: "*.yml",
            linters: { "yaml-lint": null },
        },
    ],
};
