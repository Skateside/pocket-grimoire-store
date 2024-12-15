import { PocketGrimoireError } from "../../../errors";

export class CannotChangeOfficialIntoTokenError extends PocketGrimoireError {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "CannotChangeOfficialIntoTokenError";
    }
}
