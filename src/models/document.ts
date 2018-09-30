import arangojs, { aql, Database } from 'arangojs';
// tslint:disable-next-line:no-submodule-imports
import { BaseCollection } from 'arangojs/lib/cjs/collection';
import * as arangolize from 'arangolize';
import { get, keys } from 'lodash';
import { IConfigOptions } from '../interfaces';
import { DocumentHandle } from '../interfaces/collection.interface';
import Schema from '../schemas/schema';

export default class Model {
  public static options: IConfigOptions; // connection options
  public static schema = null; // user schema

  public static normalSchema: any = null;
  public static collection: BaseCollection | any;
  public static database: Database;
  public static aql = aql;

  public static _getSchema () {
    if (!this.normalSchema) {
      this.normalSchema = new Schema(this.schema);
    }
    return this.normalSchema;
  }

  public static async _getDatabase () {

    if (Model.database) {
      return Model.database;
    }

    const dbName = this.options.database;
    const host = this.options.host || 'localhost';
    const port = this.options.port || 8529;
    const username = this.options.username || 'root';
    const password = this.options.password || '';
    const protocol = this.options.protocol || `${host === 'localhost' ? 'http' : 'https'}`;
    const url = this.options.url || `${protocol}://${username}:${password}@${host}:${port}`;

    const db = arangojs({
      url
    });

    try {
      await db.createDatabase(dbName);
    } catch (e) {
      // throw new Error(get(e, 'response.body.errorMessage', e))
    }

    db.useDatabase(dbName);

    Model.database = db;
    return db;
  }

  public static async _getCollection () {
    if (this.collection) {
      await this._setIndexes(this.collection);
      return this.collection;
    }

    const db = await this._getDatabase();
    const collection = db.collection(this.name);
    try {
      await collection.create();
      await this._setIndexes(collection);
    // tslint:disable-next-line:no-empty
    } catch (e) {
    }
    return this.collection = collection;
  }

  public static async _setIndexes (collection: any) {
    const schema = this._getSchema() as any;
    for (const field of schema.fields) {
      if (!field.options.index) { continue; }

      const path = field.path.join('.');
      const unique = field.options.unique;
      await collection.createHashIndex(path, {unique});
    }
  }

  public static async _call (method: any, ...args: any[]) {
    try {
      const collection = await this._getCollection();
      if (!collection[method]) {
        throw Error(`Collection has no method '${method}'`);
      }

      return await collection[method](...args);
    } catch (e) {
      throw new Error(get(e, 'response.body.errorMessage', e));
    }
  }

  public static _validate (data: any) {
    const schema = this._getSchema() as any;
    schema.validate(data);
  }

  public static _getDocument (documentHandle: DocumentHandle) {
    return this._call('document', documentHandle);
  }

  public static _getDocuments (documentHandles: DocumentHandle) {
    return this._call('lookupByKeys', documentHandles);
  }

  public static _createModelByDocument (document: object | any) {
    const model = Object.create(this.prototype);
    this._documentToModel(model, document);
    model.constructor();
    return model;
  }

  public static _documentToModel (model: any, document: any) {
    const schema = this._getSchema() as any;
    schema.documentToModel(model, document);
    return model;
  }

  public static _modelToDocument (model: any) {
    const schema = this._getSchema() as any;
    const document = {};
    schema.modelToDocument(model, document);
    return document;
  }

  /******************* public static methods *******************/
  public static async add (data: any) {
    this._validate(data);
    data = this._modelToDocument(data);
    data._removed = false;
    data.createdAt = new Date().toISOString();
    const documentHandle = await this._call('save', data);
    const document = await this._call('document', documentHandle);
    return this._createModelByDocument(document);
  }

  public static async get (documentHandle: DocumentHandle) {
    const document = await this._getDocument(documentHandle);
    return this._createModelByDocument(document);
  }

  public static async getArr (documentHandles: DocumentHandle) {
    const documents = await this._getDocuments(documentHandles);
    return documents.map((document: any) => {
      return this._createModelByDocument(document);
    });
  }

  public static async save (model: any) {
    this._validate(model);
    const document = this._modelToDocument(model) as any;
    document.updatedAt = new Date().toISOString();
    const newHandle = await this._call('update', model._id, document);
    model._rev = newHandle._rev;
    return model;
  }

  public static async update (model: any) {
    const document = await this._getDocument(model);
    this._documentToModel(model, document);
    return model;
  }

  public static async remove (model: any) {
    model._removed = true;
    return this.save(model);
  }

  public static async restore (model: any) {
    model._removed = false;
    return this.save(model);
  }

  public static async find (args: any, andCount = false) {
    const db = await this._getDatabase();
    const { bindVars, query } = await arangolize({
      collection: this.name,
      ...args
    });

    const cursor = await db.query({
      query,
      // tslint:disable-next-line:object-literal-sort-keys
      bindVars
    });
    const docs = await cursor.all();
    const documents = docs[0];

    if (documents) {
      const { limit, include } = args;
      const modeled = await Promise.all(documents.data.map(async (data: any) => {
        const modelFromDoc = include ? data : this._createModelByDocument(data);

        return modelFromDoc;
      }));

      if (andCount) {
        return {
          data: modeled,
          meta: documents.meta
        };
      }

      return limit === 1 ? modeled[0] : modeled;
    }
  }

  public static async findOne (args: any = {}) {
    args.skip = 0;
    args.limit = 1;
    const model = await this.find(args);
    return model;
  }

  public static async findAndCount (args: any = {}) {
    const results = await this.find(args, true);
    return results;
  }

  public static async count (selector: any) {
    const cursor = await this._call('byExample', selector);
    return cursor.count;
  }

  public static async have (selector: any) {
    const model = await this.findOne(selector);
    return !!model;
  }

  public save: any;
  public remove: any;
  public restore: any;
  public update: any;

  constructor() {

    /******************* public methods *******************/
    this.save = this.save(this);
    this.update = this.update(this);
    this.remove = this.remove(this);
    this.restore = this.restore(this);
  }
}
