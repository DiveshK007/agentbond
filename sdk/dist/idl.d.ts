export declare const IDL: {
    address: string;
    metadata: {
        name: string;
        version: string;
        spec: string;
    };
    instructions: ({
        name: string;
        discriminator: number[];
        accounts: ({
            name: string;
            writable: boolean;
            pda: {
                seeds: ({
                    kind: string;
                    value: number[];
                    path?: undefined;
                } | {
                    kind: string;
                    path: string;
                    value?: undefined;
                })[];
            };
            signer?: undefined;
            address?: undefined;
        } | {
            name: string;
            writable: boolean;
            signer: boolean;
            pda?: undefined;
            address?: undefined;
        } | {
            name: string;
            address: string;
            writable?: undefined;
            pda?: undefined;
            signer?: undefined;
        })[];
        args: {
            name: string;
            type: string;
        }[];
    } | {
        name: string;
        discriminator: number[];
        accounts: ({
            name: string;
            writable: boolean;
            pda: {
                seeds: ({
                    kind: string;
                    value: number[];
                    path?: undefined;
                } | {
                    kind: string;
                    path: string;
                    value?: undefined;
                })[];
            };
            signer?: undefined;
            address?: undefined;
        } | {
            name: string;
            writable: boolean;
            signer: boolean;
            pda?: undefined;
            address?: undefined;
        } | {
            name: string;
            address: string;
            writable?: undefined;
            pda?: undefined;
            signer?: undefined;
        })[];
        args: {
            name: string;
            type: {
                option: string;
            };
        }[];
    } | {
        name: string;
        discriminator: number[];
        accounts: ({
            name: string;
            writable: boolean;
            pda?: undefined;
            signer?: undefined;
            address?: undefined;
        } | {
            name: string;
            pda: {
                seeds: ({
                    kind: string;
                    value: number[];
                    path?: undefined;
                } | {
                    kind: string;
                    path: string;
                    value?: undefined;
                })[];
            };
            writable?: undefined;
            signer?: undefined;
            address?: undefined;
        } | {
            name: string;
            writable: boolean;
            signer: boolean;
            pda?: undefined;
            address?: undefined;
        } | {
            name: string;
            address: string;
            writable?: undefined;
            pda?: undefined;
            signer?: undefined;
        })[];
        args: {
            name: string;
            type: string;
        }[];
    } | {
        name: string;
        discriminator: number[];
        accounts: ({
            name: string;
            writable: boolean;
            pda?: undefined;
            optional?: undefined;
            isOptional?: undefined;
            signer?: undefined;
            address?: undefined;
        } | {
            name: string;
            writable: boolean;
            pda: {
                seeds: {
                    kind: string;
                    value: number[];
                }[];
            };
            optional?: undefined;
            isOptional?: undefined;
            signer?: undefined;
            address?: undefined;
        } | {
            name: string;
            writable: boolean;
            optional: boolean;
            isOptional: boolean;
            pda?: undefined;
            signer?: undefined;
            address?: undefined;
        } | {
            name: string;
            writable: boolean;
            signer: boolean;
            pda?: undefined;
            optional?: undefined;
            isOptional?: undefined;
            address?: undefined;
        } | {
            name: string;
            address: string;
            writable?: undefined;
            pda?: undefined;
            optional?: undefined;
            isOptional?: undefined;
            signer?: undefined;
        })[];
        args: ({
            name: string;
            type: string;
        } | {
            name: string;
            type: {
                array: (string | number)[];
                option?: undefined;
            };
        } | {
            name: string;
            type: {
                option: string;
                array?: undefined;
            };
        })[];
    } | {
        name: string;
        discriminator: number[];
        accounts: ({
            name: string;
            writable?: undefined;
            signer?: undefined;
            address?: undefined;
        } | {
            name: string;
            writable: boolean;
            signer?: undefined;
            address?: undefined;
        } | {
            name: string;
            writable: boolean;
            signer: boolean;
            address?: undefined;
        } | {
            name: string;
            address: string;
            writable?: undefined;
            signer?: undefined;
        })[];
        args: {
            name: string;
            type: string;
        }[];
    } | {
        name: string;
        discriminator: number[];
        accounts: ({
            name: string;
            writable: boolean;
            pda?: undefined;
            signer?: undefined;
            address?: undefined;
        } | {
            name: string;
            writable: boolean;
            pda: {
                seeds: ({
                    kind: string;
                    value: number[];
                    path?: undefined;
                } | {
                    kind: string;
                    path: string;
                    value?: undefined;
                })[];
            };
            signer?: undefined;
            address?: undefined;
        } | {
            name: string;
            writable: boolean;
            signer: boolean;
            pda?: undefined;
            address?: undefined;
        } | {
            name: string;
            address: string;
            writable?: undefined;
            pda?: undefined;
            signer?: undefined;
        })[];
        args: never[];
    })[];
    accounts: {
        name: string;
        discriminator: number[];
    }[];
    types: {
        name: string;
        type: {
            kind: string;
            fields: ({
                name: string;
                type: string;
            } | {
                name: string;
                type: {
                    array: (string | number)[];
                };
            })[];
        };
    }[];
    errors: {
        code: number;
        name: string;
        msg: string;
    }[];
};
export type AgentBondIDL = typeof IDL;
//# sourceMappingURL=idl.d.ts.map