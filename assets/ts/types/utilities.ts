export type IObjectDiff = (
    { type: "remove" }
    | { type: "new" | "update", value: any }
    | { type: "children", value: Record<PropertyKey, IObjectDiff> }
)
