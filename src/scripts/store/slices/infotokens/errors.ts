import { PocketGrimoireError } from "../../../errors";

// Trying to change an official info token.
export class CannotChangeOfficialIntoTokenError extends PocketGrimoireError {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "CannotChangeOfficialIntoTokenError";
    }
}

// Unable to find a matching info token.
export class UnrecognisedInfoTokenError extends PocketGrimoireError {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "UnrecognisedInfoTokenError";
    }
}
