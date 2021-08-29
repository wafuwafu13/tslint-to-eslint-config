import { convertNoUnnecessaryFieldInitialization } from "../no-unnecessary-field-initialization";

describe(convertNoUnnecessaryFieldInitialization, () => {
    test("conversion without arguments", () => {
        const result = convertNoUnnecessaryFieldInitialization({
            ruleArguments: [],
        });

        expect(result).toEqual({});
    });
});
