/**
 * @license MIT
 * @author Sébastien Règne
 */

import type Wrapper from "../core/wrapper/wrapper.js";
import type Level from "./level.d.ts";

type WrapperContext = {
    fix: boolean;
    level: Level;
    root: string;
    files: string[];
};

export type TypeofWrapper = new (
    context: WrapperContext,
    options: Record<string, unknown>,
) => Wrapper;
export default TypeofWrapper;
