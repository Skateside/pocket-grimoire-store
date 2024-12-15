export class PocketGrimoireError extends Error {
    readonly pg: true;
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "PocketGrimoireError";
        Object.defineProperty(this, "pg", {
            value: true,
            writable: false,
        });
    }
}

export class UnrecognisedSliceError extends PocketGrimoireError {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "UnrecognisedSliceError";
    }
}
