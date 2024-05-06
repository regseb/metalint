/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

/**
 * @type {import("../src/core/types.js").Config}
 */
export default {
    patterns: [
        "**",
        // Ignorer les répertoires générés.
        "!/.git/**",
        "!/.stryker/**",
        "!/jsdocs/**",
        "!/node_modules/**",
        "!/types/**",
        "!/tmp/**",
        // Ignorer les fichiers de configuration de Visual Studio Code.
        "!/.vscode/**",
        // Ignorer les fichiers de configuration de IntelliJ IDEA.
        "!/.idea/**",
        // Ignorer les fichiers temporaires de Vim.
        "!*.swp",
        // Ignorer les autres lockfiles.
        "!/bun.lockb",
        "!/pnpm-lock.yaml",
        "!/yarn.lock",
    ],
    checkers: [
        {
            patterns: "*.js",
            linters: [
                "prettier",
                "prettier_javascript",
                "eslint",
                "eslint_node",
            ],
            overrides: [
                {
                    patterns: "/src/bin/**",
                    linters: "eslint_bin",
                },
                {
                    patterns: "/test/**",
                    linters: "eslint_test",
                },
                {
                    patterns: "**/wrapper/*",
                    linters: "eslint_wrapper",
                },
                {
                    patterns: "*.config.js",
                    linters: "eslint_config",
                },
            ],
        },
        {
            patterns: "*.md",
            linters: ["prettier", "markdownlint"],
            overrides: {
                patterns: "/CHANGELOG.md",
                linters: "markdownlint_changelog",
            },
        },
        {
            patterns: "*.json",
            linters: ["prettier", "prantlf__jsonlint"],
            overrides: {
                patterns: "/package.json",
                linters: ["npm-package-json-lint", "publint"],
            },
        },
        {
            patterns: "*.yml",
            linters: ["prettier", "yaml-lint"],
        },
        {
            patterns: "*.svg",
            linters: "prettier",
        },
    ],
};
