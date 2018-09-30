import FieldType from './field-type';


export default class FieldTypes extends FieldType {
  public internal: any;
  public options: any;
	constructor (basePath: any, path?: any, type?: any, options?: any, internal?: any) {
		super(basePath, path, type, options, internal);
	}

	public validate (data: any, basePath: any) {
		if (this.internal) { return; }
		const array = this.getByPath(data);
		if (!array && this.options.optional) {
			return;
		}

		if (!Array.isArray(array)) {
			this.typeError(Array, array, basePath);
		}

		array.forEach((value: any, index: any) => {
			if (!this.validateValue(value, null)) {
				this.typeError(this.type, value, basePath, [index]);
			}
		});
	}

	public convertToModelValue (array: any) {
		if (!array && this.options.optional) {
			return;
		}

		return array.map((value: any) =>
			super.convertToModelValue(value)
		);
	}

	public convertToDocumentValue (array: any) {
		if (!array && this.options.optional) {
			return;
		}

		return array.map((value: any) =>
			super.convertToDocumentValue(value)
		);
	}
}

