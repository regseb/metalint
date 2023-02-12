module.exports = {
    // Enlever cette option lors de passage à Prettier 3.
    // https://github.com/prettier/prettier/issues/13142
    trailingComma: "all",
    overrides: [
        {
            files: ["*.cjs", "*.js", "*.ts"],
            options: { tabWidth: 4 },
        },
    ],
};
