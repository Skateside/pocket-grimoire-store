import type {
    IAppGetSlice,
} from "../types/app";
import type {
    IInfoToken,
} from "../store/slices/infotokens/types";
import {
    findOrDie,
    findOrDieCached,
    renderTemplate,
} from "../utilities/dom";
import {
    strip,
    toHTML,
} from "../utilities/markdown";
import Dialog from "../ui/Dialog";

export default function infoTokens(getSlice: IAppGetSlice) {

    const slice = getSlice("info-tokens");
    const wrapper = findOrDie("#info-token-wrapper");

    // Render the list of info token triggers.

    const renderTrigger = (infoToken: IInfoToken) => {

        return renderTemplate("#info-token-template", {
            ".js--info-token--wrapper"(element) {
                element.dataset.id = infoToken.id;
            },
            ".js--info-token--trigger"(element) {
                Object.assign(element.dataset, infoToken);
                element.textContent = strip(infoToken.text);
                element.style.setProperty("--bg", `var(--${infoToken.colour})`);
            },
        })

    };

    Object
        .entries(slice.references.getByType())
        .forEach(([type, infoTokens]) => {

            const list = findOrDieCached(`[data-type="${type}"]`, wrapper);

            infoTokens.forEach((infoToken) => {
                list.append(renderTrigger(infoToken));
            });

        });

    // When a trigger is clicked, pass information about the info toekn to the
    // dialog. The trigger element itself is already set up to show the dialog.

    const dialogElement = findOrDie<HTMLDialogElement>("#info-token-dialog");
    const dialogText = findOrDie("#info-token-dialog-text");
    const dialog = Dialog.create(dialogElement);

    wrapper.addEventListener("click", ({ target }) => {

        const htmlTarget = target as HTMLElement;

        if (htmlTarget.classList.contains("js--info-token--trigger")) {

            const {
                id,
                text,
                type,
                colour,
            } = htmlTarget.dataset as IInfoToken;

            dialogElement.style.setProperty("--colour", `var(--${colour})`);
            dialogElement.classList.toggle("is-custom", type === "custom");
            dialogElement.dataset.id = id;
            dialogElement.dataset.text = text;
            dialogText.innerHTML = toHTML(text);

        }

    });

    // Add functionality for the dialog's "edit" and "delete" buttons.

    const form = findOrDie<HTMLFormElement>("#info-token-form");
    const idInput = findOrDie<HTMLInputElement>("#info-token-custom-id");
    const textInput = findOrDie<HTMLInputElement>("#info-token-custom-text");
    const submitButton = findOrDie<HTMLFormElement>("#info-token-form-submit");

    dialogElement.addEventListener("click", ({ target }) => {

        const htmlTarget = (target as HTMLElement)
            .closest<HTMLButtonElement>("[data-action]");

        if (!htmlTarget) {
            return;
        }

        const { id, text } = dialogElement.dataset;

        switch (htmlTarget.dataset.action) {

        case "edit":
            idInput.value = id!;
            textInput.value = text!;
            submitButton.textContent = submitButton.dataset.update!;
            form.hidden = false;
            dialog.hide();
            break;

        case "delete":
            slice.actions.remove(id!);
            form.reset();
            dialog.hide();
            break;

        }

    });

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

    // Update the list of info token triggers whenever the slice is updated.

    const { on } = slice.events;

    on("add", (infoToken) => {

        const list = findOrDieCached("[data-type=\"custom\"]", wrapper);
        list.append(renderTrigger(infoToken));

    });

    on("update", (infoToken) => {

        const trigger = findOrDie(`[data-id="${infoToken.id}"]`, wrapper);
        trigger.replaceWith(renderTrigger(infoToken));

    });

    on("remove", (id) => {
        findOrDie(`[data-id="${id}"]`, wrapper).remove();
    });

}
