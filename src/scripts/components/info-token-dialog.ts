import type {
    IComponentInfoTokenDialogData,
    IComponentRenderInfo,
} from "../types/classes";
import Component from "../Component";
import {
    findOrDie,
    findOrDieCached,
} from "../utilities/dom";
import Dialog from "../ui/Dialog";
import {
    toHTML,
} from "../utilities/markdown";

export default new Component("info-token-dialog", ({
    data,
    getSlice,
    render,
    get,
}) => {

    const element = findOrDie<HTMLDialogElement>("#info-token-dialog");
    const dialog = get("dialog", () => new Dialog(element));
    const slice = getSlice("info-tokens");
    const infoToken = slice.references.getByIdOrDie(data.id);

    element.style.setProperty("--colour", infoToken.colour);
    const text = findOrDieCached("#info-token-dialog-text");
    text.innerHTML = toHTML(infoToken.text);

    renderList(infoToken.roleIds || [], render);
    dialog.show();

    // TODO:

    // const { on } = slice.events;

    // on("add-role", ({ roleIds }) => renderList(roleIds, render));
    // on("clear-roles", () => renderList([], render));

    // click button to add a role
    // click button to remove a role
    // click button to clear roles

    return element;

});

const renderList = (
    roleIds: string[],
    render: IComponentRenderInfo<IComponentInfoTokenDialogData>["render"],
) => {

    const list = findOrDieCached("#info-token-dialog-list");
    list.innerHTML = "";
    roleIds.forEach((id) => list.append(render("role-token", { id })!));
    list.hidden = roleIds.length > 0;

};
