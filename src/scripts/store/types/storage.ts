export type IStorage = {
    set(key: string, value: any): void,
    get(key: string): any,
};
