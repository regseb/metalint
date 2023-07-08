/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import mock from "mock-fs";
import sinon from "sinon";
import Glob from "../../../../src/core/utils/glob.js";

if (undefined === import.meta.resolve) {
    /**
     * Résous un chemin relatif à partir du module.
     *
     * @param {string} specifier Le chemin relatif vers un fichier ou un
     *                           répertoire.
     * @returns {string} L'URL absolue vers le fichier ou le répertoire.
     * @see https://nodejs.org/api/esm.html#importmetaresolvespecifier-parent
     */
    import.meta.resolve = (specifier) => {
        return new URL(specifier, import.meta.url).href;
    };
}

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
    });

    describe("walk()", function () {
        it("should work", async function () {
            mock({
                foo: {
                    "bar.js": "",
                    baz: {
                        "qux.js": "",
                        "quux.js": "",
                    },
                },
            });
            const stub = sinon.stub(process, "cwd").callsFake(() => {
                return path.join(stub.wrappedMethod(), "foo");
            });

            const cwd = process.cwd();
            let root = stub.wrappedMethod();
            let glob = new Glob(["**/bar.js"], { cwd, root });
            let files = await glob.walk("./");
            assert.deepEqual(files, ["bar.js"]);

            root = process.cwd();
            glob = new Glob(["**/bar.js"], { cwd, root });
            files = await glob.walk("./");
            assert.deepEqual(files, ["bar.js"]);

            root = process.cwd();
            glob = new Glob(["**/qux.js"], { cwd, root });
            files = await glob.walk("baz/");
            assert.deepEqual(files, ["baz/qux.js"]);

            root = process.cwd();
            glob = new Glob(["**/quux.js"], { cwd, root });
            files = await glob.walk("baz/qux.js");
            assert.deepEqual(files, []);

            root = process.cwd();
            glob = new Glob(["!baz/**", "**"], { cwd, root });
            files = await glob.walk("baz/");
            assert.deepEqual(files, []);
        });
    });
});
