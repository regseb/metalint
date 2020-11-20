export type Location = {
    line:       number,
    column?:    number,
    lineEnd?:   number,
    columnEnd?: number,
};

export type Notice = {
    file:      string,
    linter:    string,
    rule:      string | null,
    severity:  number,
    message:   string,
    locations: Location[],
};

export type Checker = {
    patterns: string[],
    level:    number,
    linters:  Object,
};

export type Formatter = {
    notify: Function,
    finalize?: Function,
};

export type Config = {
    patterns:  Object[],
    level:     number,
    reporters: Formatter[],
    checkers:  Checker[],
};
