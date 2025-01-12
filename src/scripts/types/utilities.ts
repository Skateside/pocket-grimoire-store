export type IObjectDiff = Record<string, (
    { type: "remove" }
    | { type: "new" | "update", value: any }
    | { type: "children", value: IObjectDiff }
)>;
