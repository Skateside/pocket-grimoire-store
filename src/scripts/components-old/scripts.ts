import type {
    IAppGetSlice,
} from "../types/app";
import {
    findOrDie,
    renderTemplate,
} from "../utilities/dom";
import Tabs from "../ui/Tabs";
import File from "../input-processor/File";
import URL from "../input-processor/URL";
import Paste from "../input-processor/Paste";

export default function scripts(getSlice: IAppGetSlice) {

    const setFieldsActive = (
        fields: Record<string, File | URL | Paste>,
        input: HTMLInputElement | HTMLTextAreaElement,
    ) => {

        Object.values(fields).forEach((field) => {

            const isActive = field.is(input);

            field.setActive(isActive);
            field.setRequired(isActive);
            field.setCustomValidity("");

        });

    };
    
    const slice = getSlice("roles");

    // Create the tabs.

    Tabs.create(findOrDie("#script-tabs"));

    // Draw the official scripts.

    const list = findOrDie("#script-select-list");

    Object.entries(slice.references.getScripts())
        .forEach(([id, script], index) => {

            list.append(renderTemplate("#script-select-template", {
                ".js--script-select--label"(element) {
                    const label = element as HTMLLabelElement;
                    label.htmlFor = `script-${id}`;
                },
                ".js--script-select--input"(element) {
                    const input = element as HTMLInputElement;
                    input.id = `script-${id}`;
                    input.value = id;
                    input.required = index === 0;
                },
                ".js--script-select--name"(element) {
                    const meta = slice.helpers.getMetaRole(script);
                    element.textContent = meta?.name || "";
                },
            }));

        });
    
    // Handle form submissions.

    const selectForm = findOrDie<HTMLFormElement>("#script-select-form");

    selectForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const input = selectForm.querySelector<HTMLInputElement>(":checked");
        const value = input?.value || "";

        if (!value) {
            return;
        }

        slice.actions.setScript(slice.references.getScriptById(value));

    });

    const customForm = findOrDie<HTMLFormElement>("#script-custom-form");
    const customFields = {
        upload: new File(findOrDie("#script-custom-upload")),
        url: new URL(findOrDie("#script-custom-url")),
        paste: new Paste(findOrDie("#script-custom-paste")),
    };

    customForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const fields = Object.values(customFields);
        fields.forEach((field) => field.setCustomValidity(""));
        const field = fields.find((field) => field.isActive());

        if (!field) {
            return;
        }

        field.process().then(
            ({ success, message }) => {

                if (success) {
                    slice.actions.setScript(message);
                } else {
                    field.setCustomValidity(message);
                    customForm.reportValidity();
                }

            },
            (reason) => {
                field.setCustomValidity(reason);
                customForm.reportValidity();
            },
        );

    });

    // Handle the user interacting with a custom field.

    Object.values(customFields).forEach((field) => {

        const input = field.getInput();

        input.addEventListener("input", () => {
            setFieldsActive(customFields, input);
        });

    });

    setFieldsActive(customFields, customFields.upload.getInput());

}
