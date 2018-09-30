 /* tslint:disable */
import { DocumentHandle } from '../interfaces/collection.interface';
import EdgeSchema from '../schemas/edgeSchema';
import Model from './document';

export default class Edge extends Model {
    public static normalSchema: any = null;
    public static collection: any = null;
    public static schema: any;

    public static _getSchema() {
        if (!this.normalSchema) {
            this.normalSchema = new EdgeSchema(this.schema);
        }
        return this.normalSchema;
    }

    public static _getDocument(documentHandle: DocumentHandle) {
        return this._call('edge', documentHandle);
    }
    public static _call(arg0: string, documentHandle: DocumentHandle): any {
        throw new Error("Method not implemented.");
    }

    public static async _getCollection() {
        if (this.collection) {
            return this.collection;
        }

        const db = await this._getDatabase();
        const edge = db.edgeCollection(this.name);
        try {
            await edge.create();
            await this._setIndexes(edge);
        } catch (e) {
            //
        }

        return this.collection = edge;
    }
    public static _getDatabase(): any {
        throw new Error("Method not implemented.");
    }
    public static _setIndexes(edge: any): any {
        throw new Error("Method not implemented.");
    }

    public static async add(from: any, to: any, data: any = {}) {
        super._validate(data);
        data = super._modelToDocument(data);
        data._removed = false;
        data.createdAt = new Date().toISOString();
        data._from = typeof from === 'object' ? from._id : from;
        data._to = typeof to === 'object' ? to._id : to;
        const documentHandle = await this._call('save', data);
        const document = await this._call('edge', documentHandle);
        return super._createModelByDocument(document);
    }
}
