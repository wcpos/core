import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

type Schema = import('@nozbe/watermelondb/Schema').TableSchemaSpec;

/**
 * Product - Tag pivot table
 *
 */
export const productTagSchema: Schema = {
	name: 'product_tags',
	columns: [
		{ name: 'product_id', type: 'string' },
		{ name: 'tag_id', type: 'string' },
	],
};

/**
 * Product - Tag pivot table
 *
 */
export default class ProductTag extends Model {
	static table = 'product_tags';

	static associations = {
		products: { type: 'belongs_to', key: 'product_id' },
		tags: { type: 'belongs_to', key: 'tag_id' },
	};

	@field('product_id') product_id!: string;
	@field('tag_id') tag_id!: string;
}