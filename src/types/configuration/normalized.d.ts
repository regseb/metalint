/**
 * @license MIT
 * @author Sébastien Règne
 */

import type Level from "../level.d.ts";
import type TypeofFormatter from "../typeofformatter.d.ts";
import type TypeofWrapper from "../typeofwrapper.d.ts";

export type NormalizedConfigReporter = {
    formatter: TypeofFormatter;
    level: Level;
    options: Record<string, unknown>[];
};

export type NormalizedConfigLinter = {
    wrapper: TypeofWrapper;
    fix: boolean | undefined;
    level: Level;
    options: Record<string, unknown>[];
};

export type NormalizedConfigOverride = {
    patterns: string[];
    fix: boolean | undefined;
    level: Level;
    linters: NormalizedConfigLinter[];
};

export type NormalizedConfigChecker = {
    patterns: string[];
    fix: boolean | undefined;
    level: Level;
    linters: NormalizedConfigLinter[];
    overrides: NormalizedConfigOverride[];
};

export type NormalizedConfig = {
    patterns: string[];
    fix: boolean;
    level: Level;
    reporters: NormalizedConfigReporter[];
    checkers: NormalizedConfigChecker[];
};
