import TsHelper, { TsHelperOption } from './core';
export interface RegisterOption {
    tsHelperClazz?: typeof TsHelper;
}
export default class Register {
    tsHelperClazz: typeof TsHelper;
    constructor(options?: RegisterOption);
    init(options?: TsHelperOption): void;
}
export { Register };
