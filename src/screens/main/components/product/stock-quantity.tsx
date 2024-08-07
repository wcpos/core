import * as React from 'react';

import isFinite from 'lodash/isFinite';
import { useObservableEagerState } from 'observable-hooks';

import { Text } from '@wcpos/tailwind/src/text';

import { useAppState } from '../../../../contexts/app-state';
import { useT } from '../../../../contexts/translations';

interface Props {
	product: import('@wcpos/database').ProductDocument;
	className?: string;
}

const StockQuantity = ({ product, size }: Props) => {
	const stockQuantity = useObservableEagerState(product.stock_quantity$);
	const manageStock = useObservableEagerState(product.manage_stock$);
	const t = useT();
	const { store } = useAppState();
	const decimalSeparator = useObservableEagerState(store.price_decimal_sep$);
	const displayStockQuantity = String(stockQuantity).replace('.', decimalSeparator);

	/**
	 * Early exit
	 */
	if (!manageStock || !isFinite(stockQuantity)) {
		return null;
	}

	return (
		<Text className={className}>
			{t('{quantity} in stock', { quantity: displayStockQuantity, _tags: 'core' })}
		</Text>
	);
};

export default StockQuantity;
