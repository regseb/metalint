/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import { fileURLToPath } from "node:url";
import Glob from "../../../../src/core/utils/glob.js";
import createTempFileSystem from "../../../utils/fake.js";

describe("src/core/utils/glob.js", function () {
    describe("test()", function () {
        it("should reject all file with no pattern", function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            const glob = new Glob([], { cwd, root });
            assert.equal(glob.test("./"), false);
            assert.equal(glob.test("foo/"), false);
            assert.equal(glob.test("bar"), false);
            assert.equal(glob.test("baz/qux/"), false);
            assert.equal(glob.test("baz/quux"), false);
        });

        it("should accept only root", function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            const glob = new Glob(["/"], { cwd, root });
            assert.equal(glob.test("./"), true);
            assert.equal(glob.test("foo/"), false);
            assert.equal(glob.test("bar"), false);
            assert.equal(glob.test("baz/qux/"), false);
            assert.equal(glob.test("baz/quux"), false);
        });

        it("should accept only files", function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            const glob = new Glob(["*"], { cwd, root });
            assert.equal(glob.test("./"), false);
            assert.equal(glob.test("foo/"), false);
            assert.equal(glob.test("bar"), true);
            assert.equal(glob.test("baz/qux/"), false);
            assert.equal(glob.test("baz/quux"), true);
        });

        it("should accept only directories", function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            const glob = new Glob(["*/"], { cwd, root });
            assert.equal(glob.test("./"), false);
            assert.equal(glob.test("foo/"), true);
            assert.equal(glob.test("bar"), false);
            assert.equal(glob.test("baz/qux/"), true);
            assert.equal(glob.test("baz/quux"), false);
        });

        it("should accept only files in first level", function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            const glob = new Glob(["/*"], { cwd, root });
            assert.equal(glob.test("./"), false);
            assert.equal(glob.test("foo/"), false);
            assert.equal(glob.test("bar"), true);
            assert.equal(glob.test("baz/qux/"), false);
            assert.equal(glob.test("baz/quux"), false);
        });

        it("should accept only directories in first level", function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            const glob = new Glob(["/*/"], { cwd, root });
            assert.equal(glob.test("./"), false);
            assert.equal(glob.test("foo/"), true);
            assert.equal(glob.test("bar"), false);
            assert.equal(glob.test("baz/qux/"), false);
            assert.equal(glob.test("baz/quux"), false);
        });

        it("should accept files in depth", function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            const glob = new Glob(["foo"], { cwd, root });
            assert.equal(glob.test("foo"), true);
            assert.equal(glob.test("bar"), false);
            assert.equal(glob.test("baz/foo"), true);
            assert.equal(glob.test("qux/quux/foo"), true);
        });

        it('should support "/**/"', function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            const glob = new Glob(["/foo/**/bar"], { cwd, root });
            assert.equal(glob.test("foobar"), false);
            assert.equal(glob.test("foo/bar"), true);
            assert.equal(glob.test("foo/baz"), false);
            assert.equal(glob.test("foo/baz/bar"), true);
            assert.equal(glob.test("foo/baz/qux"), false);
            assert.equal(glob.test("foo/baz/qux/bar"), true);
            assert.equal(glob.test("foo/baz/qux/quux"), false);
        });

        it('should support "/**"', function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            const glob = new Glob(["/foo/**"], { cwd, root });
            assert.equal(glob.test("foobar"), false);
            assert.equal(glob.test("foo/bar"), true);
            assert.equal(glob.test("foo/bar/baz"), true);
        });

        it('should support "?"', function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            const glob = new Glob(["foo?bar"], { cwd, root });
            assert.equal(glob.test("foobar"), false);
            assert.equal(glob.test("fooXbar"), true);
            assert.equal(glob.test("fooXXbar"), false);
        });

        it('should support "[]"', function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            const glob = new Glob(["foo[12]"], { cwd, root });
            assert.equal(glob.test("foo"), false);
            assert.equal(glob.test("foo1"), true);
            assert.equal(glob.test("foo2"), true);
            assert.equal(glob.test("foo3"), false);
            assert.equal(glob.test("foo12"), false);
            assert.equal(glob.test("foo["), false);
            assert.equal(glob.test("foo[12]"), false);
        });

        it('should support "{}"', function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            const glob = new Glob(["foo{bar,baz}"], { cwd, root });
            assert.equal(glob.test("foo"), false);
            assert.equal(glob.test("foobar"), true);
            assert.equal(glob.test("foobaz"), true);
            assert.equal(glob.test("foobarbaz"), false);
            assert.equal(glob.test("fooqux"), false);
            assert.equal(glob.test("fooba"), false);
            assert.equal(glob.test("foo{bar,baz}"), false);
        });

        it("should reject file", function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            const glob = new Glob(["!foo", "**"], { cwd, root });
            assert.equal(glob.test("foo"), false);
            assert.equal(glob.test("foobar"), true);
            assert.equal(glob.test("baz"), true);
        });

        it("should reject all sub-files in directory", function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            const glob = new Glob(["!/foo/**", "**"], { cwd, root });
            assert.equal(glob.test("foo/"), false);
            assert.equal(glob.test("foo/bar"), false);
            assert.equal(glob.test("foo/baz/"), false);
            assert.equal(glob.test("qux"), true);
            assert.equal(glob.test("quux/"), true);
            assert.equal(glob.test("corge/foo/"), true);
        });

        it("should sanitize pattern", function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            const glob = new Glob(["foo("], { cwd, root });
            assert.equal(glob.test("foo"), false);
            assert.equal(glob.test("foo("), true);
            assert.equal(glob.test("foo()"), false);
        });

        it('should sanitize pattern in "[]"', function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            const glob = new Glob(["foo[)(]"], { cwd, root });
            assert.equal(glob.test("foo"), false);
            assert.equal(glob.test("foo("), true);
            assert.equal(glob.test("foo)"), true);
            assert.equal(glob.test("foo()"), false);
        });

        it('should sanitize "!" when it isn\'t first', function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            const glob = new Glob(["foo!"], { cwd, root });
            assert.equal(glob.test("foo"), false);
            assert.equal(glob.test("foo!"), true);
            assert.equal(glob.test("foo!bar"), false);
        });

        it('should reject "**" not followed by a slash', function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            assert.throws(() => new Glob(["/**foo"], { cwd, root }), {
                name: "Error",
                message: "/**foo: '**' not followed by a slash.",
            });
        });

        it('should reject "**" not preceded by a slash', function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            assert.throws(() => new Glob(["foo**"], { cwd, root }), {
                name: "Error",
                message: "foo**: '**' not preceded by a slash.",
            });
        });

        it('should reject "[" not closed', function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            assert.throws(() => new Glob(["foo[bar"], { cwd, root }), {
                name: "Error",
                message: "foo[bar: ']' missing.",
            });
        });

        it('should reject "{" not closed', function () {
            const cwd = fileURLToPath(import.meta.resolve("."));
            const root = fileURLToPath(import.meta.resolve("."));
            assert.throws(() => new Glob(["foo{bar"], { cwd, root }), {
                name: "Error",
                message: "foo{bar: '}' missing.",
            });
        });
    });

    describe("walk()", function () {
        it("should work", async function () {
            const root = await createTempFileSystem({
                "foo.js": "",
                bar: {
                    "baz.js": "",
                    "qux.js": "",
                },
            });

            const cwd = process.cwd();
            let glob = new Glob(["**"], { cwd, root });
            let files = await glob.walk("./");
            assert.deepEqual(files, [
                "./",
                "bar/",
                "bar/baz.js",
                "bar/qux.js",
                "foo.js",
            ]);

            glob = new Glob(["**/foo.js"], { cwd, root });
            files = await glob.walk("./");
            assert.deepEqual(files, ["foo.js"]);

            glob = new Glob(["**/baz.js"], { cwd, root });
            files = await glob.walk("bar/");
            assert.deepEqual(files, ["bar/baz.js"]);

            glob = new Glob(["**/qux.js"], { cwd, root });
            files = await glob.walk("bar/baz.js");
            assert.deepEqual(files, []);

            glob = new Glob(["!bar/**", "**"], { cwd, root });
            files = await glob.walk("bar/");
            assert.deepEqual(files, []);
        });
    });
});
