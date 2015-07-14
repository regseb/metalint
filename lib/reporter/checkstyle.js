/* global require, module */

var SEVERITY = require("../severity");

var encode = function (value) {
    var ENTITIES = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&apos;",
        "\"": "&quot;"
    };
    for (var entity in ENTITIES) {
        value = value.replace(new RegExp(entity, "g"), ENTITIES[entity]);
    }
    return value;
}; // encode()

var reporter = function (results, writer) {
    writer.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    writer.write("<checkstyle version=\"6.8\">\n");
    for (var file in results) {
        if (null === results[file]) {
            continue;
        }

        writer.write("  <file name=\"" + file + "\">\n");
        results[file].forEach(function (notice) {
            writer.write("    <error");

            if (null !== notice.locations) {
                writer.write(" line=\"" + notice.locations[0].line + "\"");
                if ("column" in notice.locations[0]) {
                    writer.write(" column=\"" + notice.locations[0].column +
                                 "\"");
                }
            }

            writer.write(" severity=\"");
            switch (notice.severity) {
                case SEVERITY.FATAL: writer.write("error");   break;
                case SEVERITY.ERROR: writer.write("error");   break;
                case SEVERITY.WARN:  writer.write("warning"); break;
                case SEVERITY.INFO:  writer.write("info");    break;
            }
            writer.write("\"");

            writer.write(" message=\"" + encode(notice.message) + "\"");

            writer.write(" source=\"" + encode(notice.linter));
            if (null !== notice.rule) {
                writer.write("." + encode(notice.rule));
            }
            writer.write("\" />\n");
        });
        writer.write("  </file>\n");
    }
    writer.write("</checkstyle>\n");
}; // reporter()

module.exports = reporter;
