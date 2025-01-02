// Base for all Pocket Grimoire errors - allows them to be easily identified.
export class PocketGrimoireError extends Error {
    readonly pg!: true;
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "PocketGrimoireError";
        Object.defineProperty(this, "pg", {
            value: true,
            writable: false,
        });
    }
}

// class Store
// Attempting to call a reference from its own accessor (infinite loop).
export class SelfReferenceError extends PocketGrimoireError {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "SelfReferenceError";
    }
}

// class Store
// The requested slice has not been recognised.
export class UnrecognisedSliceError extends PocketGrimoireError {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "UnrecognisedSliceError";
    }
}

// findOrDie()
// The requested element wasn't found - this is the "die" part of "find or die".
export class CannotFindElementError extends PocketGrimoireError {
    constructor(message?: string) {
        super(message);
        this.name = "CannotFindElementError";
    }
}

// findOrDie()
// A root was passed to findOrDie() but that element wasn't found.
export class MissingRootError extends PocketGrimoireError {
    constructor(message?: string) {
        super(message);
        this.name = "MissingRootError";
    }
}
