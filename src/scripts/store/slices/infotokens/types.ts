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
    type: "official" | "custom",
};

export type IInfoModifiers = {
    add: IInfoToken["text"],
    update: RequireOnly<IInfoToken, "id" | "text">,
    remove: IInfoToken["id"],
};

export type IInfoAccessors = {
    getByType: () => Record<IInfoToken["type"], IInfoToken[]>,
};

export type IInfoEvents = {
    add: IInfoToken,
    update: IInfoToken,
    remove: IInfoToken["id"],
};
