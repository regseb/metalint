/**
 * @license MIT
 * @author Sébastien Règne
 */

import type Level from "../level.d.ts";
import type TypeofFormatter from "../typeofformatter.d.ts";
import type TypeofWrapper from "../typeofwrapper.d.ts";

export type PartialConfigLevel =
    // Désactiver la règle sur l'ordre pour utiliser le même ordre dans
    // l'énumaration et dans les chaines de caractères.
    // eslint-disable-next-line @typescript-eslint/sort-type-constituents
    Level | "OFF" | "FATAL" | "ERROR" | "WARN" | "INFO";

export type PartialConfigOption = Record<string, unknown> | string;

export type PartialConfigReporter = {
    formatter: TypeofFormatter | string;
    level?: PartialConfigLevel | undefined;
    options?: PartialConfigOption | PartialConfigOption[] | undefined;
};

export type PartialConfigLinter =
    | string
    | {
          wrapper: TypeofWrapper | string;
          fix?: boolean | undefined;
          level?: PartialConfigLevel | undefined;
          options?: PartialConfigOption | PartialConfigOption[] | undefined;
      };

export type PartialConfigOverride = {
    patterns?: string[] | string | undefined;
    fix?: boolean | undefined;
    level?: PartialConfigLevel | undefined;
    linters?: PartialConfigLinter | PartialConfigLinter[] | undefined;
};

export type PartialConfigChecker = {
    patterns?: string[] | string | undefined;
    fix?: boolean | undefined;
    level?: PartialConfigLevel | undefined;
    linters?: PartialConfigLinter | PartialConfigLinter[] | undefined;
    overrides?: PartialConfigOverride | PartialConfigOverride[] | undefined;
};

export type PartialConfig = {
    patterns: string[] | string;
    fix?: boolean | undefined;
    level?: PartialConfigLevel | undefined;
    reporters?: PartialConfigReporter | PartialConfigReporter[] | undefined;
    checkers?: PartialConfigChecker | PartialConfigChecker[] | undefined;
};
