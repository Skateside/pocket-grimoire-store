import type {
    AnyObject,
} from "../types/lib";
import type {
    IAppGetSlice,
} from "../types/app";
import type {
    IRoleScript,
} from "../store/slices/roles/types";
import type {
    II18nAccessors,
} from "../store/slices/i18n/types";
import {
    findOrDie,
    renderTemplateMany,
} from "../utilities/dom";
import {
    supplant,
} from "../utilities/strings";

export default function roles(getSlice: IAppGetSlice) {

    const rolesSlice = getSlice("roles");
    const i18nSlice = getSlice("i18n");
    const { trans } = i18nSlice.references;

    // Draw the groups.

    const groups = findOrDie("#role-select-groups");
    groups.append(drawGroups(
        ["townsfolk", "outsider", "minion", "demon", "traveller"],
        trans,
    ));
    const legends = Array.prototype.reduce.call(
        groups.querySelectorAll("[data-id] .js--role-select-group--legend"),
        (collection, legend) => {
            const id = legend.closest("[data-id]").dataset.id as string;
            (collection as AnyObject)[id] = legend;
            return collection
        },
        Object.create(null),
    ) as Record<string, HTMLLegendElement>;

    Object
        .values(legends)
        .forEach((legend) => updateText(legend, groups.dataset.text!));

    // drawRoles(rolesSlice.references.getScript(), i18nSlice.references.trans);
    drawRoles(rolesSlice.references.getScript());

    rolesSlice.events.on("script-set", (script) => {
        drawRoles(script);
    });

}

const drawGroups = (groupIds: string[], trans: II18nAccessors["trans"]) => {

    return renderTemplateMany(
        "#role-select-group-template",
        groupIds.map((id) => [id, trans(id)]),
        ([id, text]) => ({
            ".js--role-select-group--team"(element) {
                element.dataset.id = id;
            },
            ".js--role-select-group--legend"(element) {
                element.dataset.group = text;
                element.dataset.count = "0";
                element.dataset.max = "X";//UNKNOWN_MAX;
            },
        }),
    );

};

// const drawRoles = (script: IRoleScript, trans: (key: string) => string) => {
const drawRoles = (script: IRoleScript) => {

    if (!script.length) {
        return;
    }

    // return trans("abc");

};

const updateText = (legend: HTMLLegendElement, text: string) => {

    const {
        group,
        count,
        max,
    } = legend.dataset;

    legend.textContent = supplant(text, [
        group!,
        count!,
        max!,
    ]);

};
