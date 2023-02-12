/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

export default {
    patterns: [
        "!/.git/",
        "!/coverage/",
        "!/jsdocs/",
        "!/node_modules/",
        "!/types/",
        "!*.swp",
        "**",
    ],
    checkers: [
        {
            patterns: ["!CHANGELOG.md", "*.md", "*.yml"],
            linters: "prettier",
        },
        {
            patterns: ["*.cjs", "*.js", "*.ts"],
            linters: {
                prettier: [
                    "prettier.config.js",
                    "prettier_tabWidth4.config.js",
                ],
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
            patterns: "/.metalint/**/*.js",
            linters: {
                eslint: ["eslint.config.js", "eslint_config.config.js"],
            },
        },
        {
            patterns: ["!/CHANGELOG.md", "*.md"],
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
