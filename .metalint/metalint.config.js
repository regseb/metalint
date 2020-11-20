export default {
    patterns: [
        "!/.git/",
        "!/coverage/",
        "!/jsdocs/",
        "!/node_modules/",
        "!/test/data/",
        "**",
    ],
    checkers: [
        {
            patterns: ["/bin/**/*.js", "/lib/**/*.js"],
            linters: "eslint",
        }, {
            patterns: "/.metalint/**/*.js",
            linters: {
                eslint: ["eslint.config.js", "eslint_config.config.js"],
            },
        }, {
            patterns: "/test/**/*.js",
            linters: { eslint: ["eslint.config.js", "eslint_test.config.js"] },
        }, {
            patterns: ["!/CHANGELOG.md", "*.md"],
            linters: "markdownlint",
        }, {
            patterns: "*.json",
            linters: { "jsonlint-mod": null },
        }, {
            patterns: "*.yml",
            linters: { "yaml-lint": null },
        }, {
            patterns: "/package.json",
            linters: "david",
        },
    ],
};
