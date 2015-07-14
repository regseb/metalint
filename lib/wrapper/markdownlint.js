/* global require, module */

var markdownlint = require("markdownlint");
var SEVERITY     = require("../severity");

var RULES = {
    "MD001": "Header levels should only increment by one level at a time.",
    "MD002": "First header should be a h1 header.",
    "MD003": "Header style.",
    "MD004": "Unordered list style.",
    "MD005": "Inconsistent indentation for list items at the same level.",
    "MD006": "Consider starting bulleted lists at the beginning of the line.",
    "MD007": "Unordered list indentation.",
    "MD009": "Trailing spaces.",
    "MD010": "Hard tabs.",
    "MD011": "Reversed link syntax.",
    "MD012": "Multiple consecutive blank lines.",
    "MD013": "Line length.",
    "MD014": "Dollar signs used before commands without showing output.",
    "MD018": "No space after hash on atx style header.",
    "MD019": "Multiple spaces after hash on atx style header.",
    "MD020": "No space inside hashes on closed atx style header.",
    "MD021": "Multiple spaces inside hashes on closed atx style header.",
    "MD022": "Headers should be surrounded by blank lines.",
    "MD023": "Headers must start at the beginning of the line.",
    "MD024": "Multiple headers with the same content.",
    "MD025": "Multiple top level headers in the same document.",
    "MD026": "Trailing punctuation in header.",
    "MD027": "Multiple spaces after blockquote symbol.",
    "MD028": "Blank line inside blockquote.",
    "MD029": "Ordered list item prefix.",
    "MD030": "Spaces after list markers.",
    "MD031": "Fenced code blocks should be surrounded by blank lines.",
    "MD032": "Lists should be surrounded by blank lines.",
    "MD033": "Inline HTML.",
    "MD034": "Bare URL used.",
    "MD035": "Horizontal rule style.",
    "MD036": "Emphasis used instead of a header.",
    "MD037": "Spaces inside emphasis markers.",
    "MD038": "Spaces inside code span elements.",
    "MD039": "Spaces inside link text.",
    "MD040": "Fenced code blocks should have a language specified."
};

var wrapper = function (source, options, level) {
    if (SEVERITY.ERROR > level) {
        return [];
    }
    var notices = [];

    var results = markdownlint.sync({ "strings": { "source": source },
                                      "config": options });
    for (var rule in results.source) {
        results.source[rule].forEach(function (line) {
            notices.push({
                "linter": "markdownlint",
                "rule": rule,
                "severity": SEVERITY.ERROR,
                "message": RULES[rule],
                "locations": [{ "line": line }]
            });
        });
    }

    return notices;
}; // wrapper()

module.exports = wrapper;
