#!/usr/bin/env node

import fs from "node:fs/promises";
import process from "node:process";
import { fileURLToPath } from "node:url";
import Metalint from "../core/index.js";
import Severities from "../core/severities.js";
import { parse } from "./argv.js";

const argv = await parse();
if (argv.help) {
    process.stdout.write(
        await fs.readFile(fileURLToPath(import.meta.resolve("./help.txt"))),
    );
    process.exit(0);
}

try {
    const metalint = await Metalint.fromFileSystem({
        config: argv.config,
        fix: argv.fix,
        formatter: argv.formatter,
        level: argv.level,
    });
    const results = await metalint.lintFiles(argv.bases);
    const severity = await metalint.report(results);

    let code;
    switch (severity) {
        case Severities.FATAL:
            code = 2;
            break;
        case Severities.ERROR:
            code = 1;
            break;
        default:
            code = 0;
    }
    process.exit(code);
} catch (err) {
    process.stderr.write(`metalint: ${err.message}\n`);
    process.stderr.write(`${err.stack}\n`);
    process.exit(11);
}
