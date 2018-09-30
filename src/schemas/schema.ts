import FieldModel from '../fields/field-model';
import FieldModels from '../fields/field-models';
import FieldSchemas from '../fields/field-schemas';
import FieldType from '../fields/field-type';
import FieldTypes from '../fields/field-types';
import Model from '../models/document';

export default class Schema {
  public fields: any;
  public basePath: any;

  constructor (userSchema = null, basePath: any[] = [], isRootSchema = true) {
    this.basePath = basePath;
    this.fields = this.parseUserSchema(userSchema);

    if (isRootSchema) {
      this.fields.push(new FieldType(basePath, ['_id'], String, null, true));
      this.fields.push(new FieldType(basePath, ['_key'], String, null, true));
      this.fields.push(new FieldType(basePath, ['_rev'], String, null, true));
      this.fields.push(new FieldType(basePath, ['_removed'], Boolean, null, true));
      this.fields.push(new FieldType(basePath, ['createdAt'], String, null, true));
      this.fields.push(new FieldType(basePath, ['updatedAt'], String, null, true));
    }
  }

  public parseUserSchema(userSchema: any, parentPath: string[] = []): any {
    const basePath = this.basePath;
    const fields = [];

    for (const key in userSchema) {
      if (userSchema.hasOwnProperty(key)) {
        const path = [...parentPath, key];
        let value = userSchema[key];

        let options = value;
        if ('$type' in value) {
          value = value.$type;
        } else {
          options = {};
        }

        if (typeof value === 'function') {
          if (value.prototype instanceof Model) {
            fields.push(new FieldModel(basePath, path, value, options));
          } else {
            fields.push(new FieldType(basePath, path, value, options));
          }

        } else if (Array.isArray(value)) {

          const firstItem = value[0];
          if (typeof firstItem === 'function') {
            if (firstItem.prototype instanceof Model) {
              fields.push(new FieldModels(basePath, path, firstItem, options));
            } else {
              fields.push(new FieldTypes(basePath, path, firstItem, options));
            }
          } else {
            fields.push(new FieldSchemas(basePath, path, firstItem, options));
          }

        } else {
          const subFields = this.parseUserSchema(value, path) as any;
          fields.push(...subFields);
        }
      }
    }

    return fields;
  }

  public validate (data: any, basePath: any = []) {
    this.fields.forEach((field: any) =>
      field.validate(data, basePath)
    );
  }

  public documentToModel (model: any, document: any) {
    this.fields.forEach((field: any) => {
      field.documentToModel(model, document);
    });
    return model;
  }

  public modelToDocument (model: any, document: any) {
    this.fields.forEach((field: any) => {
      field.modelToDocument(model, document);
    });
    return document;
  }

  public [Symbol.iterator] () {
    return this.fields.values();
  }
}
