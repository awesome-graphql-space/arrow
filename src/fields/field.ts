 /* tslint:disable */
import ValidationError from '../errors/validation-error';

/** @abstract class */
export default abstract class Field {
  public options: any;
  public basePath: any[];
  public internal: boolean;
  public path: any;
  constructor(basePath = [], path: any, options = {}, internal = false) {
    if (!internal) { this.checkPath(path, basePath); }
    this.options = this.normalizeOptions(options);
    this.basePath = basePath;
    this.internal = internal;
    this.path = path;
  }

  public isOptional(value: any) {
    return (!value) && this.options.optional;
  }

  public normalizeOptions(options: any) {
    const normalOptions = {} as any;
    for (const key in options) {
      if (options.hasOwnProperty(key)) {
        const value = options[key];
        /* tslint:disable-next-line */
        const normalKey = key.match(/^\$?(.*)/)[1];
        normalOptions[normalKey] = value;
      }
    }

    if (normalOptions.unique) {
      normalOptions.index = true;
    }

    return normalOptions;
  }

  public checkPath(path: any, basePath: any[]) {
    for (const prop of path) {
      const match = prop.match(/^([_$])/);
      if (match) {
        const stringPath = this.pathsToString([basePath, path]);
        throw Error(`Field names can not begin with a '${match[1]}' symbol, but have '${stringPath}'`);
      }
    }
  }

  public pathsToString(subPaths: any[]) {
    const props = [].concat(...subPaths);

    const prettyPath = props.map((prop, index) => {
      if (!/^[A-Za-z$_]+$/.test(prop)) { return `[${prop}]`; }
      if (index === 0) { return prop; }
      return `.${prop}`;
    }).join('');

    return prettyPath;
  }

  public valueToString(value: any) {
    if (Object(value) === value) { return value.constructor.name; }
    if (typeof value === 'string') { return `'${value}'`; }
    return value;
  }

  public typeError(type?: any, value?: any, basePath?: any, subPath?: any) {
    const valueText = this.valueToString(value);
    const message = `must be ${type.name}, but have ${valueText}`;
    this.throwError(message, basePath, subPath);
  }

  public throwError(message?: string, basePath: any = this.basePath, subPath?: any[]) {
    const subPaths = [basePath, this.path, subPath];
    const pathString = this.pathsToString(subPaths);
    throw new ValidationError(`Field '${pathString}' ${message}`);
  }

  public documentToModel(model: any, document: any) {
    let value = this.getByPath(document);
    value = this.convertToModelValue(value);
    this.setByPath(model, value);
  }

  public modelToDocument(model: any, document: any) {
    let value = this.getByPath(model);
    value = this.convertToDocumentValue(value);
    this.setByPath(document, value);
  }

  public abstract validate(a: any, b: any): void;

  public abstract convertToModelValue(value: any): void;

  public abstract convertToDocumentValue(value: any): void;

  public getByPath(context: any) {
    for (const prop of this.path) {
      context = context ? context[prop] : undefined;
    }
    return context;
  }

  public setByPath(context: any, value: any) {
    const path = this.path.slice();
    const lastProp = path.pop();

    for (const prop of path) {
      if (!context[prop]) { context[prop] = {}; }
      context = context[prop];
    }

    return context[lastProp] = value;
  }
}
