import Model from '../models/document';
import Field from './field';

export default class FieldModel extends Field {
  public Model: any;
  public symbol: symbol;
	constructor(basePath: any, path: any, model: Model, options: any, internal: boolean = false) {
		super(basePath, path, options, internal);
		this.Model = model;
		this.symbol = Symbol();
	}

	public validate (data: any, basePath: any) {
		if (this.internal) { return; }
		if (data instanceof Model) { return; }
		const subModel = this.getByPath(data);

		if (!this.validateValue(subModel)) {
			this.typeError(this.Model, subModel, basePath);
		}
	}

	public validateValue(value: any) {
		return value instanceof this.Model;
	}

	public documentToModel(model: any, document: any) {
		const id = this.getByPath(document);
		this.setBySymbol(model, this.symbol, id);
		this.setAccessorByPath(model);
	}

	public modelToDocument(model: any, document: any) {
		if (this.internal) { return; }
		if (model instanceof Model) {
			const id = this.getBySymbol(model, this.symbol);
			this.setByPath(document, id);
		}
		else {
			const subModel = this.getByPath(model);
			const id = subModel._id;
			this.setByPath(document, id);
		}
	}

	public setAccessorByPath(model: any) {
		const path = this.path.slice();
		const lastProp = path.pop();
		let context = model;

		for (const prop of path) {
			if (!context[prop]) { context[prop] = {}; }
			context = context[prop];
		}

		Object.defineProperty(context, lastProp, {
			// enumerable: true,
			configurable: true,
			get: ()=> this.fieldGetter(model),
			set: (value)=> this.fieldSetter(model, value)
		});
	}

	public fieldGetter(model: any) {
		const id = this.getBySymbol(model, this.symbol);
		return this.Model.get(id);
	}

	public fieldSetter(model: any, value: any) {
		if (!this.validateValue(value)) {
			this.typeError(this.Model, value);
		}
		const id = value._id;
		this.setBySymbol(model, this.symbol, id);
	}

	public getBySymbol(context: any, symbol: any) {
		const path = this.path.slice(0, -1);

		for (const prop of path) {
			context = context[prop];
		}
		return context[symbol];
	}

	public setBySymbol(context: any, symbol: any, value: any) {
		const path = this.path.slice(0, -1);

		for (const prop of path) {
			if (!context[prop]) { context[prop] = {}; }
			context = context[prop];
		}

		return context[symbol] = value;
  }


  public convertToModelValue(value: any): void {
    throw new Error("Method not implemented.");
  }
  public convertToDocumentValue(value: any): void {
    throw new Error("Method not implemented.");
  }

}
