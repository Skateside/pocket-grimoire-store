export type IInfoToken = {
    id: string,
    text: string,
    colour: string,
    type: "official" | "custom",
};

export type IInfoReducers = {
    add: string,
};

export type IInfoEvents = {
    add: IInfoToken,
    remove: {
        index: number,
        id: string,
    },
};
