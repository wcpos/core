import * as React from 'react';

import flatten from 'lodash/flatten';
import get from 'lodash/get';
import { useObservableState } from 'observable-hooks';

import Table, { TableExtraDataProps, CellRenderer } from '@wcpos/components/src/table';
import Text from '@wcpos/components/src/text';
import useWhyDidYouUpdate from '@wcpos/hooks/src/use-why-did-you-update';

import * as cells from './cells';
import useCart from '../../../../../contexts/cart';
import useUI from '../../../../../contexts/ui';
import { t } from '../../../../../lib/translations';

type ColumnProps = import('@wcpos/components/src/table').ColumnProps;
type Sort = import('@wcpos/components/src/table').Sort;
type SortDirection = import('@wcpos/components/src/table').SortDirection;
type OrderDocument = import('@wcpos/database').OrderDocument;
type LineItemDocument = import('@wcpos/database').LineItemDocument;
type FeeLineDocument = import('@wcpos/database').FeeLineDocument;
type ShippingLineDocument = import('@wcpos/database').ShippingLineDocument;
type CartItem = LineItemDocument | FeeLineDocument | ShippingLineDocument;
type UIColumn = import('../../../../../contexts/ui').UIColumn;
type Cart = (LineItemDocument | FeeLineDocument | ShippingLineDocument)[];

/**
 *
 */
const CartTable = () => {
	const { ui } = useUI('pos.cart');
	const columns = useObservableState(ui.get$('columns'), ui.get('columns')) as UIColumn[];
	const cart = useCart();
	const items = React.useMemo(() => flatten(Object.values(cart)), [cart]); // @TODO - add sorting

	/**
	 *
	 */
	const cellRenderer = React.useCallback<CellRenderer<CartItem>>(({ item, column, index }) => {
		const Cell = get(cells, [item.collection.name, column.key]);

		if (Cell) {
			return <Cell item={item} column={column} index={index} />;
		}

		if (item[column.key]) {
			return <Text>{item[column.key]}</Text>;
		}

		return null;
	}, []);

	/**
	 *
	 */
	const headerLabel = React.useCallback(({ column }) => {
		switch (column.key) {
			case 'quantity':
				return t('Qty', { _tags: 'core' });
			case 'name':
				return t('Name', { _tags: 'core' });
			case 'price':
				return t('Price', { _tags: 'core' });
			case 'total':
				return t('Total', { _tags: 'core' });
			case 'subtotal':
				return t('Subtotal', { _tags: 'core' });
			default:
				return column.key;
		}
	}, []);

	/**
	 *
	 */
	const context = React.useMemo<TableExtraDataProps<CartItem>>(() => {
		return {
			columns: columns.filter((column) => column.show),
			// sort: ({ sortBy, sortDirection }) => {
			// 	setQuery('sortBy', sortBy);
			// 	setQuery('sortDirection', sortDirection);
			// },
			// sortBy: query.sortBy,
			// sortDirection: query.sortDirection,
			cellRenderer,
			headerLabel,
		};
	}, [columns, cellRenderer, headerLabel]);

	/**
	 *
	 */
	useWhyDidYouUpdate('CartTable', { ui, columns, items, cart, t, context });

	/**
	 *
	 */
	return <Table<CartItem> data={items} estimatedItemSize={46} extraData={context} />;
};

export default CartTable;