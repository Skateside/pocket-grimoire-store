// Observer

export type IObserverHandler<TDetailType = any> = (
    detail: TDetailType,
    actions: {
        cancel(): void,
        stop(): void,
    },
) => any;

export type IObserverTrigger = {
    cancelled: Readonly<boolean>,
};
