import type { RequireOnly } from "../../../types/lib";

export type IInfoToken = {
    id: string,
    text: string,
    colour: (
        "blue"
        | "dark-orange"
        | "dark-purple"
        | "green"
        | "grey"
        | "orange"
        | "purple"
        | "red"
    ),
    isCustom?: boolean,
    roleIds?: string[],
};

export type IInfoData = IInfoToken[];

export type IInfoModifiers = {
    add: IInfoToken["text"],
    update: RequireOnly<IInfoToken, "id" | "text">,
    remove: IInfoToken["id"],
};

export type IInfoAccessors = {
    getById: (id: string) => IInfoToken | void,
    getByIdOrDie: (id: string) => IInfoToken,
    getByType: () => Record<"official" | "custom", IInfoToken[]>,
};

export type IInfoEvents = {
    add: IInfoToken,
    update: IInfoToken,
    remove: IInfoToken["id"],
};

export type IInfoHelpers = {};
