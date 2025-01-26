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

export default new Component<
    IComponentInfoTokenTriggerData
>("info-token-trigger", ({
    data,
    trigger,
}) => {

    return renderTemplate("#info-token-template", {
        ".js--info-token--trigger"(element) {
            element.textContent = strip(data.text);
            element.addEventListener("click", () => {
                trigger("trigger-click", { id: data.id });
            });
        },
    });

});
