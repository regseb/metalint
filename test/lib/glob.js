import assert from "assert";
import path from "path";
import { fileURLToPath } from "url";
import * as glob from "../../lib/glob.js";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

describe("lib/glob.js", function () {
    let cwd;

    before(function () {
        cwd = process.cwd();
        process.chdir(DIRNAME);
    });

    after(function () {
        process.chdir(cwd);
    });

    it("test([])", function () {
        const patterns = [];
        const matched = glob.test("lib/index.js", patterns, DIRNAME, false);
        assert.strictEqual(matched, false);
    });

    it(`test(["**"])̀`, function () {
        const patterns = ["**"];
        let matched = glob.test("lib/index.min.js", patterns, DIRNAME, false);
        assert.strictEqual(matched, true);
        matched = glob.test("lib/", patterns, DIRNAME, true);
        assert.strictEqual(matched, true);
    });

    it(`test(["**/*.js"])`, function () {
        const patterns = ["**/*.js"];
        let matched = glob.test("lib/index.min.js", patterns, DIRNAME, false);
        assert.strictEqual(matched, true);
        matched = glob.test("index.min.js", patterns, DIRNAME, false);
        assert.strictEqual(matched, true);
        matched = glob.test("lib/index.min.js/", patterns, DIRNAME, true);
        assert.strictEqual(matched, true);
        matched = glob.test("lib/", patterns, DIRNAME, true);
        assert.strictEqual(matched, false);
        matched = glob.test("lib.js/index.html", patterns, DIRNAME, false);
        assert.strictEqual(matched, false);
    });

    it(`test(["!**/*~", "**"])̀`, function () {
        const patterns = ["!**/*~", "**"];
        let matched = glob.test("lib/index.min.js", patterns, DIRNAME, false);
        assert.strictEqual(matched, true);
        matched = glob.test("lib/index~.min.js", patterns, DIRNAME, false);
        assert.strictEqual(matched, true);
        matched = glob.test("lib/index.min.js~", patterns, DIRNAME, false);
        assert.strictEqual(matched, false);
        matched = glob.test("lib/index.js~/i.html", patterns, DIRNAME, false);
        assert.strictEqual(matched, false);
    });

    it(`test(["/**/*.md"])`, function () {
        const patterns = ["/**/*.md"];
        let matched = glob.test("src/README.md", patterns, DIRNAME, false);
        assert.strictEqual(matched, true);
        matched = glob.test("README.md", patterns, DIRNAME, false);
        assert.strictEqual(matched, true);
        matched = glob.test("README.txt", patterns, DIRNAME, false);
        assert.strictEqual(matched, false);
    });

    it(`test(["/*/*.md"])`, function () {
        const patterns = ["/*/*.md"];
        let matched = glob.test("src/README.md", patterns, DIRNAME, false);
        assert.strictEqual(matched, true);
        matched = glob.test("README.md", patterns, DIRNAME, false);
        assert.strictEqual(matched, false);
        matched = glob.test("src/README.txt", patterns, DIRNAME, false);
        assert.strictEqual(matched, false);
    });

    it(`test(["lib/**"])`, function () {
        const patterns = ["lib/**"];
        let matched = glob.test("lib", patterns, DIRNAME, true);
        assert.strictEqual(matched, true);
        matched = glob.test("lib/", patterns, DIRNAME, true);
        assert.strictEqual(matched, true);
        matched = glob.test("lib/scronpt.js", patterns, DIRNAME, false);
        assert.strictEqual(matched, true);
        matched = glob.test("library/scronpt.js", patterns, DIRNAME, false);
        assert.strictEqual(matched, false);
    });

    it(`test(["foo?bar"])`, function () {
        const patterns = ["foo?bar"];
        let matched = glob.test("foo.bar", patterns, DIRNAME, false);
        assert.strictEqual(matched, true);
        matched = glob.test("foo/bar", patterns, DIRNAME, true);
        assert.strictEqual(matched, false);
    });

    it(`test(["script[123].js"])`, function () {
        const patterns = ["script[123].js"];
        let matched = glob.test("script1.js", patterns, DIRNAME, false);
        assert.strictEqual(matched, true);
        matched = glob.test("script2.js", patterns, DIRNAME, false);
        assert.strictEqual(matched, true);
        matched = glob.test("script3.js", patterns, DIRNAME, false);
        assert.strictEqual(matched, true);
        matched = glob.test("script4.js", patterns, DIRNAME, false);
        assert.strictEqual(matched, false);
        matched = glob.test("script.js", patterns, DIRNAME, false);
        assert.strictEqual(matched, false);
    });

    it(`test(["!node/", "**"])`, function () {
        const patterns = ["!node/", "**"];
        let matched = glob.test("bower/jquery.js", patterns, DIRNAME, false);
        assert.strictEqual(matched, true);
        matched = glob.test("node/", patterns, DIRNAME, true);
        assert.strictEqual(matched, false);
        matched = glob.test("node/jquery.js", patterns, DIRNAME, false);
        assert.strictEqual(matched, false);
    });

    it(`test(["folder/"])`, function () {
        const patterns = ["folder/"];
        let matched = glob.test("folder/", patterns, DIRNAME, true);
        assert.strictEqual(matched, true);
        matched = glob.test("folder", patterns, DIRNAME, true);
        assert.strictEqual(matched, true);
        matched = glob.test("folder", patterns, DIRNAME, false);
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

        files = glob.walk([], ["**/glob.js"], DIRNAME);
        assert.deepStrictEqual(files, ["glob.js"]);

        files = glob.walk(["formatter"], ["**/console.js"], DIRNAME);
        assert.deepStrictEqual(files, ["formatter/console.js"]);

        files = glob.walk(["formatter/csv.js"], ["**/json.js"], DIRNAME);
        assert.deepStrictEqual(files, []);

        files = glob.walk(["wrapper/eslint.js"], ["!wrapper"], DIRNAME);
        assert.deepStrictEqual(files, []);
    });
});
