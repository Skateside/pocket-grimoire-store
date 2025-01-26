import Component from "../Component";
import {
    findOrDie,
} from "../utilities/dom";

export default new Component("info-token-form", ({
    getSlice,
}) => {

    const slice = getSlice("info-tokens");
    const form = findOrDie<HTMLFormElement>("#info-token-form");
    const idInput = findOrDie<HTMLInputElement>("#info-token-custom-id");
    const textInput = findOrDie<HTMLInputElement>("#info-token-custom-text");
    const submitButton = findOrDie<HTMLFormElement>("#info-token-form-submit");

    // When the "add" button is clicked, clear the form before showing it.

    findOrDie("#info-token-add").addEventListener("click", () => {

        idInput.value = "";
        textInput.value = "";
        submitButton.textContent = submitButton.dataset.create!;
        form.hidden = false;

    });

    // Submitting the form will either add a new info token or update an
    // existing one, depending on whether or not an info token's ID is known.

    form.addEventListener("submit", (e) => {

        e.preventDefault();

        const id = idInput.value;
        const text = textInput.value;
        const { add, update } = slice.actions;

        if (id) {
            update({ id, text });
        } else {
            add(text);
        }

        form.reset();

    });

    form.addEventListener("reset", () => {

        idInput.value = "";
        form.hidden = true;

    });

});
