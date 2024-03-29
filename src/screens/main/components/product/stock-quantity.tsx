import * as React from 'react';

import isFinite from 'lodash/isFinite';
import { useObservableState } from 'observable-hooks';

import Text from '@wcpos/components/src/text';

import { useT } from '../../../../contexts/translations';

interface Props {
	product: import('@wcpos/database').ProductDocument;
	size?: import('@wcpos/components/src/text').TextProps['size'];
}

const StockQuantity = ({ product, size }: Props) => {
	const stockQuantity = useObservableState(product.stock_quantity$, product.stock_quantity);
	const manageStock = useObservableState(product.manage_stock$, product.manage_stock);
	const t = useT();

	/**
	 * Early exit
	 */
	if (!manageStock || !isFinite(stockQuantity)) {
		return null;
	}

	return (
		<Text size={size}>{t('{quantity} in stock', { quantity: stockQuantity, _tags: 'core' })}</Text>
	);
};

export default StockQuantity;
