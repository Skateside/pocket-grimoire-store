export type RequireOnly<Type, Keys extends keyof Type> = (Partial<Type> & Pick<Type, Keys>);

export type Tail<List extends readonly unknown[]> = (
    List extends readonly [unknown, ...infer ListTail]
    ? ListTail
    : []
);

export type AnyFunction = (...args: any[]) => any;
