import { IArangoCollection } from "./collection.interface";

export interface IAqlQuery {
  query: string;
  bindVars: {
      [key: string]: any;
  };
}
export interface IAqlLiteral {
  toAQL: () => string;
}
export declare type AqlValue = string | number | boolean | IArangoCollection | IAqlLiteral;
