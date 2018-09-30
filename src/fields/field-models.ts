import Model from '../models/document';
import FieldModel from './field-model';

export default class FieldModels extends FieldModel {
  public arraySymbol: symbol;
  public Model: any;
  public symbol: any;

	constructor (basePath: any, path: any, model: Model, options: any, internal = false) {
		super(basePath, path, model, options, internal);
		this.arraySymbol = Symbol();
	}

	public validate (data: any, basePath: any) {
		if (this.internal) { return; }
    let array;
		if (data instanceof Model) {
			array = this.getBySymbol(data, this.arraySymbol);

			if (!array) { return; }
		}
		else {
			array = this.getByPath(data);
		}

		this.validateRealArray(array, basePath);
	}

	public validateRealArray (array: any, basePath: any) {
		if (!array && this.options.optional) {
			return;
		}

		if (!Array.isArray(array)) {
			this.typeError(Array, array, basePath);
		}

		array.forEach((value: any, index: any) => {
			if (!this.validateValue(value)) {
				this.typeError(this.Model, value, basePath, [index]);
			}
		});
	}

	public documentToModel (model: any, document: any) {
		const arrayIds = this.getByPath(document);
		this.setBySymbol(model, this.symbol, arrayIds);
		this.setAccessorByPath(model);
	}

	public modelToDocument (model: any, document: any) {
		if (this.internal) { return; }

		if (model instanceof Model) {
			const arrayIds = this.getActualIds(model);
			this.setByPath(document, arrayIds);
		} else {
			let array = this.getByPath(model);
			if (!array && this.options.optional) {
        array = [];
      }


			const arrayIds = array.map((subModel: any) => subModel._id);
			this.setByPath(document, arrayIds);
		}
	}

	public getActualIds (model: any) {
		const realArray = this.getBySymbol(model, this.arraySymbol);
		if (realArray) {
			return realArray.map((subModel: any) => subModel._id);
		}
		else {
			return this.getBySymbol(model, this.symbol);
		}
	}

	public setAccessorByPath (model: any) {
		this.setBySymbol(model, this.arraySymbol, null);
		super.setAccessorByPath(model);
	}

	public async fieldGetter (model: any) {
		let realArray = this.getBySymbol(model, this.arraySymbol);
		if (realArray) { return realArray; }
		const arrayIds = this.getBySymbol(model, this.symbol);
		realArray = this.getRealModels(arrayIds);
		this.setBySymbol(model, this.arraySymbol, realArray);
		return realArray;
	}

	public async getRealModels (arrayIds: any) {
		const resultModels = await this.Model.getArr(arrayIds);
		const subModels = {} as any;
		resultModels.forEach((subModel: any) => {
			subModels[subModel._id] = subModel;
		});
		return arrayIds.map((id: string) => subModels[id]);
	}

	public fieldSetter (model: any, realArray: any[]) {
		this.validateRealArray(realArray, null);
		this.setBySymbol(model, this.arraySymbol, realArray);
	}
}
