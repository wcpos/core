import * as React from 'react';

import find from 'lodash/find';
import { useObservableState } from 'observable-hooks';

import { useTable } from '@wcpos/tailwind/src/table';

import PriceWithTax from '../../components/product/price';

type Props = {
	item: import('@wcpos/database').ProductDocument;
	column: import('@wcpos/tailwind/src/table').ColumnProps<
		import('@wcpos/database').ProductDocument
	>;
};

const Price = ({ item: product, column }: Props) => {
	const price = useObservableState(product.price$, product.price);
	const taxStatus = useObservableState(product.tax_status$, product.tax_status);
	const taxClass = useObservableState(product.tax_class$, product.tax_class);
	const { display } = column;
	const context = useTable();

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
		<PriceWithTax
			price={price}
			taxStatus={taxStatus}
			taxClass={taxClass}
			taxDisplay={show('tax') ? 'text' : 'tooltip'}
			taxLocation={context?.taxLocation}
		/>
	);
};

export default Price;
