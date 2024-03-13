/**
 * @license MIT
 * @author Sébastien Règne
 */

import type Location from "./location.d.ts";
import type Severity from "./severity.d.ts";

export type PartialNotice = {
    file: string;
    linter: string;
    rule?: string | undefined;
    severity?: Severity;
    message: string;
    locations?: Location[];
};

export type Notice = {
    file: string;
    linter: string;
    rule: string | undefined;
    severity: Severity;
    message: string;
    locations: Location[];
};
export default Notice;
