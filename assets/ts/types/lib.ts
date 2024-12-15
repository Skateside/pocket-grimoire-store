export type RequireOnly<Type, Keys extends keyof Type> = (Partial<Type> & Pick<Type, Keys>);
