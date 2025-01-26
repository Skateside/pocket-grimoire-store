import Component from "../Component";
import {
    findOrDie,
    findOrDieCached,
} from "../utilities/dom";

export default new Component("info-token-list", ({
    getSlice,
    render,
    on,
}) => {

    const slice = getSlice("info-tokens");
    const wrapper = findOrDie("#info-token-wrapper");

    // List the info tokens that we currently know about.

    Object
        .entries(slice.references.getByType())
        .forEach(([type, infoTokens]) => {

            infoTokens.forEach(({ id, text }) => {
                const trigger = render("info-token-trigger", { id, text })!;
                findOrDieCached(`#info-token-list-${type}`).append(trigger);
            });

        });

    on("trigger-click", ({ id }) => {

        findOrDie("#info-token-dialog").replaceWith(
            render("info-token-dialog", { id })!
        );

    });

    // on("edit", ({ id, text }) => {
    //     // slice.actions.update({ id, text });
    //     // Update form rendering.
    // });

    // on("delete", ({ id }) => {
    //     // slice.actions.remove(id);
    //     // Reset the form.
    // });

    // Update the list of info token triggers whenever the slice is updated.

    const { on: onSlice } = slice.events;

    onSlice("add", (infoToken) => {

        const list = findOrDieCached("#info-token-list-custom");
        list.append(render("info-token-trigger", infoToken)!);

    });

    onSlice("update", (infoToken) => {

        const trigger = findOrDie(`[data-id="${infoToken.id}"]`, wrapper);
        trigger.replaceWith(render("info-token-trigger", infoToken)!);

    });

    onSlice("remove", (id) => {
        findOrDie(`[data-id="${id}"]`, wrapper).remove();
    });
    
});
