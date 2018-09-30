import { IConfigOptions } from './interfaces';
import Model from './models/document';
import Edge from './models/edge';

export default {
  connect: (options: IConfigOptions) => ({
    // tslint:disable-next-line:max-classes-per-file
    Model: class extends Model { public static options = options; },
    // tslint:disable-next-line:max-classes-per-file
    Edge: class extends Edge { public static options = options; }
  })
};
