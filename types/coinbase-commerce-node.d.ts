declare module 'coinbase-commerce-node' {
    export class Client {
        static init(apiKey: string): void;
    }

    export namespace resources {
        class Charge {
            static create(data: any): Promise<any>;
        }
    }
}
