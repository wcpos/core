import * as React from 'react';

import flatten from 'lodash/flatten';
import get from 'lodash/get';
import { useObservableState } from 'observable-hooks';

import Table, { TableExtraDataProps, CellRenderer } from '@wcpos/components/src/table';
import Text from '@wcpos/components/src/text';
import useWhyDidYouUpdate from '@wcpos/hooks/src/use-why-did-you-update';

import * as cells from './cells';
import { t } from '../../../../lib/translations';
import useCart from '../../contexts/cart';
import useUI from '../../contexts/ui-settings';

type ColumnProps = import('@wcpos/components/src/table').ColumnProps;
type Sort = import('@wcpos/components/src/table').Sort;
type SortDirection = import('@wcpos/components/src/table').SortDirection;
type OrderDocument = import('@wcpos/database').OrderDocument;
type LineItemDocument = import('@wcpos/database').LineItemDocument;
type FeeLineDocument = import('@wcpos/database').FeeLineDocument;
type ShippingLineDocument = import('@wcpos/database').ShippingLineDocument;
type CartItem = LineItemDocument | FeeLineDocument | ShippingLineDocument;
type UISettingsColumn = import('../../contexts/ui-settings').UISettingsColumn;
type Cart = (LineItemDocument | FeeLineDocument | ShippingLineDocument)[];

/**
 *
 */
const CartTable = () => {
	const { uiSettings } = useUI('pos.cart');
	const columns = useObservableState(
		uiSettings.get$('columns'),
		uiSettings.get('columns')
	) as UISettingsColumn[];
	const cart = useCart();
	const items = React.useMemo(() => flatten(Object.values(cart)), [cart]); // TODO - add sorting

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
			headerLabel: ({ column }) => uiSettings.getLabel(column.key),
		};
	}, [columns, cellRenderer, uiSettings]);

	/**
	 *
	 */
	useWhyDidYouUpdate('CartTable', { uiSettings, columns, items, cart, t, context });

	/**
	 *
	 */
	return <Table<CartItem> data={items} estimatedItemSize={46} extraData={context} />;
};

export default CartTable;