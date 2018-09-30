
import { IArangoCollection } from "./collection.interface";
import { ViewType } from "./view.interface";
export declare type TransactionCollections = string | IArangoCollection | Array<string | IArangoCollection> | {
    write?: string | IArangoCollection | Array<string | IArangoCollection>;
    read?: string | IArangoCollection | Array<string | IArangoCollection>;
};
export declare interface ITransactionOptions {
    lockTimeout?: number;
    maxTransactionSize?: number;
    intermediateCommitCount?: number;
    intermediateCommitSize?: number;
    waitForSync?: boolean;
}
export declare interface IServiceOptions {
    [key: string]: any;
    configuration?: {
        [key: string]: any;
    };
    dependencies?: {
        [key: string]: any;
    };
}
export interface IViewDescription {
    id: string;
    name: string;
    type: ViewType;
}
export interface ICreateDatabaseUser {
    username: string;
    passwd?: string;
    active?: boolean;
    extra?: {
        [key: string]: any;
    };
}
