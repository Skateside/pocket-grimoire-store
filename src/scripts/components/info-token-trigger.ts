import type {
    IComponentInfoTokenTriggerData,
} from "../types/classes";
import Component from "../Component";
import {
    renderTemplate,
} from "../utilities/dom";
import {
    strip,
} from "../utilities/markdown";

export default new Component<IComponentInfoTokenTriggerData>("info-token-trigger", ({
    data,
    trigger,
}) => {

    // Not sure if I can do this within the renderTemplate() function.
    // The element itself might not fully exist yet.

    // const content = renderTemplate("#info-token-template", {
    return renderTemplate("#info-token-template", {
        ".js--info-token-trigger"(element) {
            element.textContent = strip(data.text);
            element.addEventListener("click", () => {
                trigger("trigger-click", { id: data.id });
            });
        },
    });

    // content.querySelector(".js--info-token--trigger").addEventListener("click", (e) => {
    //     e.preventDefault();
    //     trigger("trigger-click", { id: data.id });
    // });

    // return content;

});
