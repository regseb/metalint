import Levels from "../core/levels.js";
import Severities from "../core/severities.js";
import Formatter from "../core/formatter/formatter.js";
import Wrapper from "../core/wrapper/wrapper.js";

export type Level = (typeof Levels)[keyof typeof Levels];
export type Severity = (typeof Severities)[keyof typeof Severities];

export type Location = {
    line: number;
    column?: number;
    endLine?: number;
    endColumn?: number;
};

export type Notice = {
    file: string;
    linter: string;
    rule: string | undefined;
    severity: Severity;
    message: string;
    locations: Location[];
};

export type PartialNotice = {
    file: string;
    linter: string;
    rule?: string | undefined;
    severity?: Severity;
    message: string;
    locations?: Location[];
};

// FLATTENED
export type FlattenedConfigReporter = {
    formatter: typeof Formatter;
    level: Level;
    options: Record<string, any>;
};

export type FlattenedConfigLinter = {
    wrapper: typeof Wrapper;
    fix: boolean | undefined;
    level: Level;
    options: Record<string, any>;
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

// NORMALIZED
export type NormalizedConfigReporter = {
    formatter: typeof Formatter;
    level: Level;
    options: Record<string, any>[];
};

export type NormalizedConfigLinter = {
    wrapper: typeof Wrapper;
    fix: boolean | undefined;
    level: Level;
    options: Record<string, any>[];
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
    fix: boolean | undefined;
    level: Level;
    reporters: NormalizedConfigReporter[];
    checkers: NormalizedConfigChecker[];
};

// PARTIAL
export type PartialConfigLevel =
    | Level
    | "OFF"
    | "FATAL"
    | "ERROR"
    | "WARN"
    | "INFO";

export type PartialConfigOption = Record<string, any> | string;

export type PartialConfigReporter = {
    formatter: typeof Formatter | string;
    level?: PartialConfigLevel | undefined;
    options?: PartialConfigOption[] | PartialConfigOption | undefined;
};

export type PartialConfigLinter =
    | {
          wrapper: typeof Wrapper | string;
          fix?: boolean | undefined;
          level?: PartialConfigLevel | undefined;
          options?: PartialConfigOption[] | PartialConfigOption | undefined;
      }
    | string;

export type PartialConfigOverride = {
    patterns?: string[] | string | undefined;
    fix?: boolean | undefined;
    level?: PartialConfigLevel | undefined;
    linters?: PartialConfigLinter[] | PartialConfigLinter | undefined;
};

export type PartialConfigChecker = {
    patterns?: string[] | string | undefined;
    fix?: boolean | undefined;
    level?: PartialConfigLevel | undefined;
    linters?: PartialConfigLinter[] | PartialConfigLinter | undefined;
    overrides?: PartialConfigOverride[] | PartialConfigOverride | undefined;
};

export type PartialConfig = {
    patterns: string[] | string;
    fix?: boolean | undefined;
    level?: PartialConfigLevel | undefined;
    reporters?: PartialConfigReporter[] | PartialConfigReporter | undefined;
    checkers?: PartialConfigChecker[] | PartialConfigChecker | undefined;
};
