import Component from "../Component";
import {
    findOrDie,
    findOrDieCached,
} from "../utilities/dom";

export default new Component("info-token-list", ({
    // data,
    getSlice,
    render,
    on,
}) => {

    const slice = getSlice("info-tokens");
    // const wrapper = findOrDie("#info-token-wrapper");

    // List the info tokens that we currently know about.

    Object
        .entries(slice.references.getByType())
        .forEach(([type, infoTokens]) => {

            infoTokens.forEach(({ id, text }) => {
                findOrDieCached(`#info-token-list-${type}`)
                    .append(render("info-token-trigger", { id, text })!);
            });

        });

    on("trigger-click", ({ id }) => {

        findOrDie("#info-token-dialog").replaceWith(
            render("info-token-dialog", { id })!
        );

    });
    

});
