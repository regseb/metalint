/* global require, module */

var fs       = require("fs");
var colors   = require("colors");
var SEVERITY = require("../severity");

var printCodeSourceLine = function (line, content, active, writer) {
    if (0 < line && line <= content.length) {
        writer.write(colors.black(("     " + line).slice(-5)) +
                     (active ? "‖" : "|") + " " + content[line - 1] + "\n");
    }
};

var printCodeSource = function (locations, content, writer) {
    var characters = [];
    locations.forEach(function (location) {
        var i;
        for (i = 0; i < characters.length; ++i) {
            if (characters[i].line === location.line) {
                if ("columns" in location) {
                    characters[i].columns.push(location.column);
                    characters[i].columns.sort();
                }
                break;
            }
        }
        if (characters.length === i) {
            characters[i] = {
                "line": location.line,
                "columns": []
            };
            if ("column" in location) {
                characters[i].columns.push(location.column);
                characters[i].columns.sort();
            }
        }
    });
    characters.sort(function (a, b) {
        return a.line - b.line;
    });

    for (var i = 0; i < characters.length; ++i) {
        var line = characters[i].line;
        printCodeSourceLine(line - 2, content, false, writer);
        printCodeSourceLine(line - 1, content, false, writer);
        printCodeSourceLine(line, content, true, writer);
        var columns = characters[i].columns;
        if (0 !== columns.length) {
            var dashs = Array(7 + columns[columns.length - 1]).join("-");
            columns.forEach(function (column) {
                dashs = dashs.substr(0, 6 + column) + "^" +
                        dashs.substr(6 + column + 1);
            });
            writer.write(colors.black(dashs) + "\n");
        }
        printCodeSourceLine(line + 1, content, false, writer);
        printCodeSourceLine(line + 2, content, false, writer);
    }
};

var reporter = function (results, writer, verbose) {
    for (var file in results) {
        var notices = results[file];
        if (null === notices) {
            if (2 <= verbose) {
                writer.write(colors.bold(file + ": No checked.") + "\n\n");
            }
            continue;
        }
        if (0 === notices.length) {
            if (1 <= verbose) {
                writer.write(colors.bold(file + ": 0 notice.") + "\n\n");
            }
            continue;
        }

        var counts = {};
        counts[SEVERITY.FATAL] = 0;
        counts[SEVERITY.ERROR] = 0;
        counts[SEVERITY.WARN] = 0;
        counts[SEVERITY.INFO] = 0;

        notices.forEach(function (notice) {
            ++counts[notice.severity];
        });

        var line = colors.bold(file) + ": ";
        if (0 < counts[SEVERITY.FATAL]) {
            line += counts[SEVERITY.FATAL] + " fatal";
            if (1 < counts[SEVERITY.FATAL]) {
                line += "s";
            }
            line += ", ";
        }
        if (0 < counts[SEVERITY.ERROR]) {
            line += counts[SEVERITY.ERROR] + " error";
            if (1 < counts[SEVERITY.ERROR]) {
                line += "s";
            }
            line += ", ";
        }
        if (0 < counts[SEVERITY.WARN]) {
            line += counts[SEVERITY.WARN] + " warning";
            if (1 < counts[SEVERITY.WARN]) {
                line += "s";
            }
            line += ", ";
        }
        if (0 < counts[SEVERITY.INFO]) {
            line += counts[SEVERITY.INFO] + " info";
            if (1 < counts[SEVERITY.INFO]) {
                line += "s";
            }
            line += ", ";
        }
        line = line.slice(0, -2) + ".";
        writer.write(colors.bold(line) + "\n");

        // FIXME Gérer correctement les tabulations.
        var content = fs.readFileSync(file).toString()
                .replace(/\t/g, "    ").split("\n");

        notices.forEach(function (notice) {
            switch (notice.severity) {
            case SEVERITY.FATAL:
                writer.write(colors.magenta("FATAL")); break;
            case SEVERITY.ERROR:
                writer.write(colors.red("ERROR")); break;
            case SEVERITY.WARN:
                writer.write(colors.yellow("WARN ")); break;
            case SEVERITY.INFO:
                writer.write(colors.blue("INFO ")); break;
            default:
                writer.write("      ");
            }
            writer.write(": " + notice.message + "\n");

            if (null !== notice.locations) {
                printCodeSource(notice.locations, content, writer);
            }

            writer.write("\n");
        });
    }
};

module.exports = reporter;
