import type {
    IAppGetSlice,
} from "../types/app";
import {
    findOrDie,
    renderTemplate,
} from "../utilities/dom";
import Tabs from "../ui/Tabs";

export default function scripts(getSlice: IAppGetSlice) {

    const tabs = new Tabs(findOrDie("#script-tabs"));
    const slice = getSlice("roles");

    // Draw the official scripts.

    const list = findOrDie("#script-select-list");

    Object.entries(slice.references.getScripts())
        .forEach(([id, script], index) => {

            // const meta = script.find((role) => (
            //     typeof role === "object" && role.id === "_meta"
            // ));
            // const meta = slice.helpers.getMeta(script);

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
                    // element.textContent = meta.name;
                },
            }));

        });

}
