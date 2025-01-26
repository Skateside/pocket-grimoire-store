import type {
    IComponentRoleTokenData,
} from "../types/classes";
import Component from "../Component";
import {
    renderTemplate,
} from "../utilities/dom";

export default new Component<IComponentRoleTokenData>("role-token", ({
    data,
    getSlice,
}) => {

    const {
        id,
        imageIndex
    } = data;
    const slice = getSlice("roles");
    const {
        name,
        image,
        setup,
        firstNight,
        otherNight,
        reminders,
        remindersGlobal,
    } = slice.references.getFullRole(id);

// NOTE: A slice can have events. We could set a "currentImage" property to get
// the current image with the correct alignment and have an event that triggers
// whenever that changes - maybe listen to see if the id matches this id.

    return renderTemplate("#role-token-template", {
        ".js--role-token--leaves"(element) {

            element.classList.toggle("role-token--setup", setup);
            element.classList.toggle(
                "role-token--left-1",
                Number(firstNight) > 0,
            );
            element.classList.toggle(
                "role-token--right-1",
                Number(otherNight) > 0,
            );
            const top = (
                (reminders || []).length
                + (remindersGlobal || []).length
            );
            element.classList.toggle(`role-token--top-${top}`, top > 0);

        },
        ".js--role-token--name"(element) {
            element.textContent = name;
        },
        ".js--role-token--image"(element) {

            if (!image) {
                element.hidden = true;
                return;
            }

// NOTE: It might be better to handle this through a "currentImage" property
// rather than passing the imageIndex into the component.
// Currently there's no storage for component state, only slices, so keeping
// data in the slices would be easier.
            const sources = (
                Array.isArray(image)
                ? image
                : [image]
            );
            const index = (
                (typeof imageIndex === "number" && imageIndex < sources.length)
                ? imageIndex
                : 0
            );

            (element as HTMLImageElement).src = sources[index];

        },
    });

});
