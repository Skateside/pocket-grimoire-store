import type {
    IRoleScript,
} from "../store/slices/roles/types";

export default abstract class InputProcessor<
    Input extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement | HTMLTextAreaElement
> {

    protected input: Input;
    protected active: boolean;

    constructor(input: Input) {
        this.input = input;
        this.active = false;
    }

    getInput() {
        return this.input;
    }

    is(input: HTMLInputElement | HTMLTextAreaElement) {
        return input === this.input;
    }

    setCustomValidity(error: string) {
        this.input.setCustomValidity(error);
    }

    setEnabled(enabled: boolean) {
        this.input.disabled = !enabled;
    }

    isEnabled() {
        return !this.input.disabled;
    }

    setRequired(required: boolean) {
        this.input.required = required;
    }

    setActive(active: boolean) {
        this.active = active;
    }

    isActive() {
        return this.isEnabled() && this.active;
    }

    process(): Promise<IRoleScript> {
        return Promise.reject(new Error("Not set up"));
    }

}
