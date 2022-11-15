export type Location = {
    line:       number,
    column?:    number,
    endLine?:   number,
    endColumn?: number,
};

export type Notice = {
    file:      string,
    linter:    string,
    rule?:     string,
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
    notify:    Function,
    finalize?: Function,
};

export type Config = {
    patterns:  string[],
    level:     number,
    reporters: Formatter[],
    checkers:  Checker[],
};
