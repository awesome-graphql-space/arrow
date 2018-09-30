import { Agent } from "https";
import { IAgentOptions } from "./agent-options.interface";

export declare type LoadBalancingStrategy = "NONE" | "ROUND_ROBIN" | "ONE_RANDOM";
export declare interface IRequestOptions {
    host?: number;
    method?: string;
    body?: any;
    expectBinary?: boolean;
    isBinary?: boolean;
    headers?: {
        [key: string]: string;
    };
    absolutePath?: boolean;
    basePath?: string;
    path?: string;
    qs?: string | {
        [key: string]: any;
    };
}

export declare type Config = string | string[] | Partial<{
    url: string | string[];
    isAbsolute: boolean;
    arangoVersion: number;
    loadBalancingStrategy: LoadBalancingStrategy;
    maxRetries: false | number;
    agent: any;
    agentOptions: {
        [key: string]: any;
    };
    headers: {
        [key: string]: string;
    };
}>;


export interface IConfigOptions {
  database: string;
  url?: string | string[];
  host?: string;
  port?: string;
  username: string;
  password: string;
  isAbsolute?: boolean;
  protocol?: string;
  headers?: object;
  agentOptions?: IAgentOptions;
  loadBalancingStrategy?: LoadBalancingStrategy;
  arangoVersion?: string;
  agent?: Agent;
  maxRetries?: number | false;
}
