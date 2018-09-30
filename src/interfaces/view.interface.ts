export declare enum ViewType {
    ARANGOSEARCH_VIEW = "arangosearch"
}
export interface IArangoView {
    isArangoView: true;
    name: string;
}
export interface IArangoViewResponse {
    name: string;
    id: string;
    type: ViewType;
}
interface IArangoSearchConsolidate {
    threshold: number;
    segmentThreshold: number;
}
interface IArangoSearchCollectionLink {
    analyzers?: string[];
    fields?: {
        [key: string]: IArangoSearchCollectionLink | undefined;
    };
    includeAllFields?: boolean;
    trackListPositions?: boolean;
    storeValues?: "none" | "id";
}
export interface IArangoSearchProperties {
    locale: string;
    commit: {
        consolidate: {
            count?: IArangoSearchConsolidate;
            bytes?: IArangoSearchConsolidate;
            bytes_accum?: IArangoSearchConsolidate;
            fill?: IArangoSearchConsolidate;
        };
        commitIntervalMsec?: number;
        cleanupIntervalStep?: number;
    };
    links: {
        [key: string]: IArangoSearchCollectionLink | undefined;
    };
}
export interface IArangoSearchPropertiesResponse extends IArangoSearchProperties, IArangoViewResponse {
    type: ViewType.ARANGOSEARCH_VIEW;
}
export interface IArangoSearchPropertiesOptions {
    locale?: string;
    commit?: {
        consolidate?: "none" | {
            count?: Partial<IArangoSearchConsolidate>;
            bytes?: Partial<IArangoSearchConsolidate>;
            bytes_accum?: Partial<IArangoSearchConsolidate>;
            fill?: Partial<IArangoSearchConsolidate>;
        };
        commitIntervalMsec?: number;
        cleanupIntervalStep?: number;
    };
    links?: {
        [key: string]: IArangoSearchCollectionLink | undefined;
    };
}
