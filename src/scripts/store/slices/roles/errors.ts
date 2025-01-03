import { PocketGrimoireError } from "../../../errors";

// The requested role hasn't been recognised.
export class UnrecognisedRoleError extends PocketGrimoireError {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "UnrecognisedRoleError";
    }
}

// The requested script hasn't been recognised.
export class UnrecognisedScriptError extends PocketGrimoireError {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "UnrecognisedScriptError";
    }
}
