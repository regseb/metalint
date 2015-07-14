/* global module */

var reporter = function (results, writer) {
    writer.write(JSON.stringify(results));
    writer.write("\n");
}; // reporter()

module.exports = reporter;
