
export declare enum CollectionType {
    DOCUMENT_COLLECTION = 2,
    EDGE_COLLECTION = 3
}
export declare type DocumentHandle = string | {
    _key?: string;
    _id?: string;
};
export declare type IndexHandle = string | {
    id?: string;
};
export interface IImportOptions {
    type?: null | "auto" | "documents" | "array";
    fromPrefix?: string;
    toPrefix?: string;
    overwrite?: boolean;
    waitForSync?: boolean;
    onDuplicate?: "error" | "update" | "replace" | "ignore";
    complete?: boolean;
    details?: boolean;
}
export interface IImportResult {
    error: false;
    created: number;
    errors: number;
    empty: number;
    updated: number;
    ignored: number;
    details?: string[];
}

export interface IArangoCollection {
    isArangoCollection: true;
    name: string;
}

export interface IDocumentSaveOptions {
    waitForSync?: boolean;
    returnNew?: boolean;
    returnOld?: boolean;
    overwrite?: boolean;
    silent?: boolean;
}
