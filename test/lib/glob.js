"use strict";

const assert = require("assert");
const glob   = require("../../lib/glob");

describe("lib/glob.js", function () {
    let cwd;

    before(function () {
        cwd = process.cwd();
        process.chdir(__dirname);
    });

    after(function () {
        process.chdir(cwd);
    });

    it("test([])", function () {
        const patterns = [];
        const matched = glob.test("lib/index.js", patterns, __dirname, false);
        assert.strictEqual(matched, false);
    });

    it(`test(["**"])̀`, function () {
        const patterns = ["**"];
        let matched = glob.test("lib/index.min.js", patterns, __dirname, false);
        assert.strictEqual(matched, true);
        matched = glob.test("lib/", patterns, __dirname, true);
        assert.strictEqual(matched, true);
    });

    it(`test(["**/*.js"])`, function () {
        const patterns = ["**/*.js"];
        let matched = glob.test("lib/index.min.js", patterns, __dirname, false);
        assert.strictEqual(matched, true);
        matched = glob.test("index.min.js", patterns, __dirname, false);
        assert.strictEqual(matched, true);
        matched = glob.test("lib/index.min.js/", patterns, __dirname, true);
        assert.strictEqual(matched, true);
        matched = glob.test("lib/", patterns, __dirname, true);
        assert.strictEqual(matched, false);
        matched = glob.test("lib.js/index.html", patterns, __dirname, false);
        assert.strictEqual(matched, false);
    });

    it(`test(["!**/*~", "**"])̀`, function () {
        const patterns = ["!**/*~", "**"];
        let matched = glob.test("lib/index.min.js", patterns, __dirname, false);
        assert.strictEqual(matched, true);
        matched = glob.test("lib/index~.min.js", patterns, __dirname, false);
        assert.strictEqual(matched, true);
        matched = glob.test("lib/index.min.js~", patterns, __dirname, false);
        assert.strictEqual(matched, false);
        matched = glob.test("lib/index.js~/i.html", patterns, __dirname, false);
        assert.strictEqual(matched, false);
    });

    it(`test(["/**/*.md"])`, function () {
        const patterns = ["/**/*.md"];
        let matched = glob.test("src/README.md", patterns, __dirname, false);
        assert.strictEqual(matched, true);
        matched = glob.test("README.md", patterns, __dirname, false);
        assert.strictEqual(matched, true);
        matched = glob.test("README.txt", patterns, __dirname, false);
        assert.strictEqual(matched, false);
    });

    it(`test(["/*/*.md"])`, function () {
        const patterns = ["/*/*.md"];
        let matched = glob.test("src/README.md", patterns, __dirname, false);
        assert.strictEqual(matched, true);
        matched = glob.test("README.md", patterns, __dirname, false);
        assert.strictEqual(matched, false);
        matched = glob.test("src/README.txt", patterns, __dirname, false);
        assert.strictEqual(matched, false);
    });

    it(`test(["lib/**"])`, function () {
        const patterns = ["lib/**"];
        let matched = glob.test("lib", patterns, __dirname, true);
        assert.strictEqual(matched, true);
        matched = glob.test("lib/", patterns, __dirname, true);
        assert.strictEqual(matched, true);
        matched = glob.test("lib/scronpt.js", patterns, __dirname, false);
        assert.strictEqual(matched, true);
        matched = glob.test("library/scronpt.js", patterns, __dirname, false);
        assert.strictEqual(matched, false);
    });

    it(`test(["foo?bar"])`, function () {
        const patterns = ["foo?bar"];
        let matched = glob.test("foo.bar", patterns, __dirname, false);
        assert.strictEqual(matched, true);
        matched = glob.test("foo/bar", patterns, __dirname, true);
        assert.strictEqual(matched, false);
    });

    it(`test(["script[123].js"])`, function () {
        const patterns = ["script[123].js"];
        let matched = glob.test("script1.js", patterns, __dirname, false);
        assert.strictEqual(matched, true);
        matched = glob.test("script2.js", patterns, __dirname, false);
        assert.strictEqual(matched, true);
        matched = glob.test("script3.js", patterns, __dirname, false);
        assert.strictEqual(matched, true);
        matched = glob.test("script4.js", patterns, __dirname, false);
        assert.strictEqual(matched, false);
        matched = glob.test("script.js", patterns, __dirname, false);
        assert.strictEqual(matched, false);
    });

    it(`test(["!node/", "**"])`, function () {
        const patterns = ["!node/", "**"];
        let matched = glob.test("bower/jquery.js", patterns, __dirname, false);
        assert.strictEqual(matched, true);
        matched = glob.test("node/", patterns, __dirname, true);
        assert.strictEqual(matched, false);
        matched = glob.test("node/jquery.js", patterns, __dirname, false);
        assert.strictEqual(matched, false);
    });

    it(`test(["folder/"])`, function () {
        const patterns = ["folder/"];
        let matched = glob.test("folder/", patterns, __dirname, true);
        assert.strictEqual(matched, true);
        matched = glob.test("folder", patterns, __dirname, true);
        assert.strictEqual(matched, true);
        matched = glob.test("folder", patterns, __dirname, false);
        assert.strictEqual(matched, false);
    });

    it("test() throws", function () {
        assert.throws(() => glob.test("", ["/**foo"], "", false), {
            name:    "Error",
            message: "/**foo: '**' not followed by a slash.",
        });

        assert.throws(() => glob.test("", ["foo**"], "", false), {
            name:    "Error",
            message: "foo**: '**' not preceded by a slash.",
        });

        assert.throws(() => glob.test("", ["fo[ou"], "", false), {
            name:    "Error",
            message: "fo[ou: ']' missing.",
        });
    });

    it("walk()", function () {
        let files = glob.walk([], ["**/glob.js"], "/");
        assert.deepStrictEqual(files, ["glob.js"]);

        files = glob.walk([], ["**/glob.js"], __dirname);
        assert.deepStrictEqual(files, ["glob.js"]);

        files = glob.walk(["formatter"], ["**/console.js"], __dirname);
        assert.deepStrictEqual(files, ["formatter/console.js"]);

        files = glob.walk(["formatter/csv.js"], ["**/json.js"], __dirname);
        assert.deepStrictEqual(files, []);

        files = glob.walk(["wrapper/eslint.js"], ["!wrapper"], __dirname);
        assert.deepStrictEqual(files, []);
    });
});
