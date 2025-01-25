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

    const slice = getSlice("roles");
    const role = slice.references.getFullRole(data.id);

    return renderTemplate("#role-token-component", {
        ".js--role-token--name"(element) {
            element.textContent = role.name;
        },
        // ...
    });

});
