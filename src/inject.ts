export type Inject = <Value>(raw: Value) => Injected<Value>;

export type Injected<Value> = Value extends (inject: Inject, ...args: infer Args) => infer Return
    ? (...args: Args) => Return
    : Value;

export const createInject = () => {
    const inject: Inject = <Value>(raw: Value): Injected<Value> => {
        if (raw instanceof Function) {
            return raw.bind(undefined, inject);
        }

        return raw as Injected<Value>;
    };

    return inject;
};
