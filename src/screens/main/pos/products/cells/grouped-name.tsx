import * as React from 'react';
import { useObservableState, ObservableResource, useObservableSuspense } from 'observable-hooks';
import { from } from 'rxjs';
import find from 'lodash/find';
import Text from '@wcpos/components/src/text';
import Box from '@wcpos/components/src/box';
import Categories from '../../../common/product-categories';
import Tags from '../../../common/product-tags';

interface Props {
	item: import('@wcpos/database').ProductDocument;
	column: import('@wcpos/components/src/table').ColumnProps<
		import('@wcpos/database').ProductDocument
	>;
}

/**
 *
 */
const GroupedNames = ({ groupedResource }) => {
	const grouped = useObservableSuspense(groupedResource);
	const names = Array.from(grouped.values()).map((doc) => doc.name);

	return (
		<Text>
			<Text size="small" type="secondary">
				Grouped:{' '}
			</Text>
			<Text size="small">{names.join(', ')}</Text>
		</Text>
	);
};

/**
 *
 */
export const GroupedName = ({ item: product, column }: Props) => {
	const { display } = column;
	const grouped_ids = useObservableState(product.grouped_products$, product.grouped_products);

	/**
	 *
	 */
	const groupedResource = React.useMemo(
		() =>
			new ObservableResource(
				from(product.collection.findByIds(grouped_ids.map((id) => String(id))))
			),
		[grouped_ids, product.collection]
	);

	/**
	 *
	 */
	const show = React.useCallback(
		(key: string): boolean => {
			const d = find(display, { key });
			return !!(d && d.show);
		},
		[display]
	);

	/**
	 *
	 */

	return (
		<Box space="xSmall">
			<Text weight="bold">{product.name}</Text>
			{show('sku') && <Text size="small">{product.sku}</Text>}
			{show('stock_quantity') && product.manage_stock && product.stock_quantity && (
				<Text size="small">{product.stock_quantity} in stock</Text>
			)}
			{show('categories') && <Categories item={product} />}
			{show('tags') && <Tags item={product} />}

			<GroupedNames groupedResource={groupedResource} />
		</Box>
	);
};

export default GroupedName;