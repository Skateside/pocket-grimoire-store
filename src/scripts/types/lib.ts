export type RequireOnly<Type, Keys extends keyof Type> = (
    Partial<Type> & Pick<Type, Keys>
);

// export type Head<List extends unknown[]> = (
//     List extends readonly [infer ListHead, ...unknown[]]
//     ? ListHead
//     : void
// );

export type Tail<List extends readonly unknown[]> = (
    List extends readonly [unknown, ...infer ListTail]
    ? ListTail
    : []
);

export type AnyFunction = (...args: any[]) => any;

export type AnyObject = Record<string, any>;
