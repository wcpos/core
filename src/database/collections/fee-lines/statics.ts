import forEach from 'lodash/forEach';
import get from 'lodash/get';
import find from 'lodash/find';

type FeeLineCollection = import('.').FeeLineCollection;
type FeeLineDocument = import('.').FeeLineDocument;

/**
 * WooCommerce Order Fee Line statics
 */
export default {
	/**
	 * Take plainData from server
	 */
	async bulkUpsert(this: FeeLineCollection, items: Record<string, unknown>[]) {
		const promises: Promise<FeeLineDocument>[] = [];

		// @TODO - data is coming in straight from REST API, need to parse first?
		forEach(items, (item) => {
			// @ts-ignore
			const _id = get(find(item.meta_data, { key: '_pos' }), 'value');
			// @ts-ignore
			const upsertedItem = this.collections().line_items.upsert({
				_id,
				...(item as Record<string, unknown>),
			});

			promises.push(upsertedItem);
		});

		return Promise.all(promises).catch((err: any) => {
			console.log(err);
		});
	},
};
