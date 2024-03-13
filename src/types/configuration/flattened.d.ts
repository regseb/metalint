/**
 * @license MIT
 * @author Sébastien Règne
 */

import type Level from "../level.d.ts";
import type TypeofFormatter from "../typeofformatter.d.ts";
import type TypeofWrapper from "../typeofwrapper.d.ts";

export type FlattenedConfigReporter = {
    formatter: TypeofFormatter;
    level: Level;
    options: Record<string, unknown>;
};

export type FlattenedConfigLinter = {
    wrapper: TypeofWrapper;
    fix: boolean;
    level: Level;
    options: Record<string, unknown>;
};

export type FlattenedConfigOverride = {
    patterns: string[];
    linters: FlattenedConfigLinter[];
};

export type FlattenedConfigChecker = {
    patterns: string[];
    linters: FlattenedConfigLinter[];
    overrides: FlattenedConfigOverride[];
};

export type FlattenedConfig = {
    patterns: string[];
    reporters: FlattenedConfigReporter[];
    checkers: FlattenedConfigChecker[];
};
