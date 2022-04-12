import schema from './schema.json';

export type TaxRateSchema = import('./interface').WooCommerceTaxRateSchema;
export type TaxRateDocument = import('rxdb').RxDocument<TaxRateSchema>;
// TaxRateMethods
export type TaxRateCollection = import('rxdb').RxCollection<TaxRateDocument>;
// TaxRateMethods,
// TaxRateStatics

// interface TaxRateMethods {}

/**
 *
 */
// export const methods: TaxRateMethods = {};

export const taxes = {
	schema,
	// pouchSettings: {},
	// statics: {},
	// methods,
	// attachments: {},
	// options: {},
	// migrationStrategies: {},
	// autoMigrate: true,
	// cacheReplacementPolicy() {},
};
