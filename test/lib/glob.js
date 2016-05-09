"use strict";

const assert   = require("assert");
const glob = require("../../lib/glob.js");

describe("lib/glob.js", function () {
    it("match()", function () {
        const patterns = [];
        let matched = glob.match("lib/index.min.js", patterns, false,
                                 "/opt/metalint", "/opt/metalint");
        assert.strictEqual(matched, false);

        patterns.push("**");
        matched = glob.match("lib/index.min.js", patterns, false,
                             "/opt/metalint", "/opt/metalint");
        assert.strictEqual(matched, true);

        patterns.push("**/*.js");
        matched = glob.match("lib/index.min.js", patterns, false,
                             "/opt/metalint", "/opt/metalint");
        assert.strictEqual(matched, true);

        patterns.push("!**/*~");
        matched = glob.match("lib/index.min.js", patterns, false,
                             "/opt/metalint", "/opt/metalint");
        assert.strictEqual(matched, true);

        patterns.push("!**/*.min.js");
        matched = glob.match("lib/index.min.js", patterns, false,
                             "/opt/metalint", "/opt/metalint");
        assert.strictEqual(matched, false);
    });

    it("walk()", function () {
        process.chdir(__dirname);
        let files = glob.walk([null], ["**/glob.js"], false, "/");
        assert.deepStrictEqual(files, ["glob.js"]);

        files = glob.walk([""], ["**/glob.js"], false, __dirname);
        assert.deepStrictEqual(files, ["glob.js"]);

        files = glob.walk(["reporter"], ["**/none.js"], true, __dirname);
        assert.deepStrictEqual(files, ["reporter/none.js"]);

        files = glob.walk(["reporter/csv.js"], ["**/json.js"], true, __dirname);
        assert.deepStrictEqual(files, []);
    });
});
