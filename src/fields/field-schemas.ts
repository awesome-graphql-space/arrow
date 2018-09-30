import Schema from '../schemas/schema';
import Field from './field';

export default class FieldSchemas extends Field {
  public schema: Schema;
  constructor (basePath: any, path?: any, userSchema?: any, options?: any, internal?: any) {
    super(basePath, path, options, internal);
    this.schema = new Schema(userSchema, [...basePath, ...path, '..'], false);
  }

  public validate (data: any, basePath: any) {
    if (this.internal) { return; }
    const array = this.getByPath(data);

    if (!Array.isArray(array)) {
      this.typeError(Array, array, basePath);
    }

    array.forEach((value: any, index: any) => {
      if (value !== Object(value)) { this.typeError(Object, value, basePath, [index]); }
      const subPath = [...basePath, ...this.path, index];
      this.schema.validate(value, subPath);
    });
  }

  public convertToModelValue (array: any) {
    return array.map((document: any) => {
      const model = {};
      return this.schema.documentToModel(model, document);
    });
  }

  public convertToDocumentValue (array: any) {
    return array.map((model: any) => {
      const document = {};
      return this.schema.modelToDocument(model, document);
    });
  }
}
