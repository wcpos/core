import schema from './schema.json';
import statics from './statics';
// import methods from './methods';
import { postCreate } from './postCreate';

export type LineItemSchema = import('rxdb').RxJsonSchema<
	import('./interface').WooCommerceOrderLineItemSchema
>;
export type LineItemDocument = import('rxdb').RxDocument<LineItemSchema, LineItemMethods>;
export type LineItemCollection = import('rxdb').RxCollection<
	LineItemDocument,
	LineItemMethods,
	LineItemStatics
>;
type LineItemMethods = typeof import('./methods');
type LineItemStatics = typeof import('./statics');

function preInsert(this: LineItemDocument, plainData: Record<string, unknown>) {
	if (!plainData.parentName) {
		plainData.parentName = '';
	}

	return plainData;
}

export const lineItems = {
	schema,
	// pouchSettings: {},
	statics,
	// methods,
	// attachments: {},
	options: {
		middlewares: {
			preInsert: {
				handle: preInsert,
				parallel: false,
			},
			preSave: {
				handle: preInsert,
				parallel: false,
			},
			postCreate: {
				handle: postCreate,
				parallel: false,
			},
		},
	},
	// migrationStrategies: {},
	// autoMigrate: true,
	// cacheReplacementPolicy() {},
};
