import Field from './field';

export default class FieldType extends Field {
  public type: any; // boolean | string | number | Date | Set<any>;
  public internal: any;
  public options: any;
	constructor (basePath: any, path: any, type: any, options: any, internal = false) {
		super(basePath, path, options, internal);
		this.checkType(type);
		this.type = type;
	}

	public checkType (type: any) {
		if (type === Boolean) { return; }
		if (type === String) { return; }
		if (type === Number) { return; }
		if (type === Date) { return; }
		if (type === Set) { return; }

		if (!type.prototype.toJSON) {
			throw Error(`Custom type '${type.name}' must have method 'toJSON'`);
		}
		if (!type.fromJSON) {
			throw Error(`Custom type '${type.name}' must have static method 'fromJSON'`);
		}
	}

	public validate (data: any, basePath: any) {
		if (this.internal) { return; }
		const value = this.getByPath(data);

		if (this.isOptional(value)) { return; }

		if (!this.validateValue(value, basePath)) {
			this.typeError(this.type, value, basePath);
		}
  }

  public isOptional(value: any): any {
    throw new Error("Method not implemented.");
  }
	public validateValue (value: any, basePath: any) {
		const type = this.type;
		const options = this.options;

		if ('enum' in options) {
			this.validateEnum(value, options, basePath);
		}

		switch (type) {
			case String:
				return this.validateString(value, options, basePath);
			case Number:
				return this.validateNumber(value, options, basePath);
			case Boolean:
				return typeof value === 'boolean';
			case Set:
				return this.validateSet(value, options, basePath);
			default:
				return value instanceof type;
		}
	}

	public validateNumber (value: any, options: any, basePath: any) {
		if (typeof value !== 'number') { return false; }

		if (!Number.isFinite(value)) {
			this.throwError(`must be finite number, but have ${value}`, basePath);
		}
		if ('min' in options) { if (value < options.min) {
			this.throwError(`must be more or equal ${options.min}, but have ${value}`, basePath);
		}
		}
		if ('max' in options) { if (value > options.max) {
			this.throwError(`must be less or equal ${options.max}, but have ${value}`, basePath);
		}
		}
		return true;
  }

  public throwError(arg0: string, basePath: any): any {
    throw new Error("Method not implemented.");
  }

	public validateString (value: any, options: any, basePath: any) {
		if (typeof value !== 'string') { return false; }

		if ('regExp' in options) { if (!options.regExp.test(value)) {
			this.throwError(`must be match regExp ${options.regExp}, but have '${value}'`, basePath);
		}
		}
		if ('min' in options) { if (value.length < options.min) {
			this.throwError(`length must be more or equal ${options.min} symbols, but have '${value}'`, basePath);
		}
		}
		if ('max' in options) { if (value.length > options.max) {
			this.throwError(`length must be less or equal ${options.max} symbols, but have '${value}'`, basePath);
		}
		}
		return true;
	}

	public validateEnum (value: any, options: any, basePath: any) {
		const enums = options.enum;
		if (enums.indexOf(value) === -1) {
			const enumText = JSON.stringify(enums);
			const valueText = this.valueToString(value);
			const message = `must be one of enum ${enumText}, but have ${valueText}`;
			this.throwError(message, basePath);
		}
	}
  public valueToString(value: any): any {
    throw new Error("Method not implemented.");
  }


	public validateSet (value: any, options: any, basePath: any) {
		if (!(value instanceof Set)) { return false; }
		if ('set' in options) {
			const sets = options.set;
			value.forEach(item => {
				if (sets.indexOf(item) === -1) {
					const setText = JSON.stringify(sets);
					const itemValue = this.valueToString(item);
					const message = `must contain item only from ${setText}, but have ${itemValue}`;
					this.throwError(message, basePath);
				}
			});
		}
		return true;
	}

	public convertToModelValue (value: any) {
		if (value == null) { return value; }
		const type = this.type;

		switch (type) {
			case String:
				return String(value);
			case Number:
				return Number(value);
			case Boolean:
				return Boolean(value);
			case Date:
				return new Date(value);
			case Set:
				return new Set(value);
		}

		return type.fromJSON(value);
	}

	public convertToDocumentValue (value: any) {
		if (value == null) { return value; }

		switch (this.type) {
			case String:
				return value;
			case Number:
				return value;
			case Boolean:
				return value;
			case Date:
				return value.getTime();
			case Set:
				return Array.from(value);
		}

		// for custom types
		return value.toJSON();
	}
}
