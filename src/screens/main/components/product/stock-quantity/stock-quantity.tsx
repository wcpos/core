import * as React from 'react';
import { useObservableState } from 'observable-hooks';
import Text from '@wcpos/components/src/text';
import { T } from '@wcpos/core/src/lib/translations';
import isFinite from 'lodash/isFinite';

interface Props {
	product: import('@wcpos/database').ProductDocument;
	size?: import('@wcpos/components/src/text').TextProps['size'];
}

export const StockQuantity = ({ product, size }: Props) => {
	const stockQuantity = useObservableState(product.stock_quantity$, product.stock_quantity);
	const manageStock = useObservableState(product.manage_stock$, product.manage_stock);

	/**
	 * Early exit, show skeleton if not downloaded yet
	 */
	if (!product.isSynced()) {
		return <Text.Skeleton length="short" />;
	}

	/**
	 * Early exit
	 */
	if (!manageStock || !isFinite(stockQuantity)) {
		return null;
	}

	return (
		<Text size={size}>
			<T _str="{quantity} in stock" quantity={stockQuantity} />
		</Text>
	);
};