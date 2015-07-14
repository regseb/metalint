/* global module */

var reporter = function (results, writer, verbose) {
    var first = true;
    for (var file in results) {
        if (null === results[file] || 0 === results[file].length) {
            continue;
        }

        // Séparer les fichiers par une ligne vide.
        if (first) {
            first = false;
        } else {
            writer.write("\n");
        }

        results[file].forEach(function (notice) {
            writer.write(file + ":");

            if (null !== notice.locations) {
                writer.write(notice.locations[0].line + ":");
                if ("column" in notice.locations[0]) {
                    writer.write(notice.locations[0].column + ":");
                } else {
                    writer.write(":");
                }
            } else {
                writer.write(":");
            }

            writer.write(" " + notice.message);
            if (1 <= verbose) {
                writer.write(" (" + notice.linter);
                if (null !== notice.rule) {
                    writer.write("." + notice.rule);
                }
                writer.write(")");
            }
            writer.write("\n");
        });
    }
}; // reporter()

module.exports = reporter;
