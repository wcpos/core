import * as React from 'react';

import Text from '@wcpos/components/src/text';

import useOrders from '../../../../../../contexts/orders';
import useCurrencyFormat from '../../../../../../hooks/use-currency-format';

const CheckoutTitle = () => {
	const { data: order } = useOrders();
	const { format } = useCurrencyFormat();

	if (!order) {
		throw new Error('Order not found');
	}

	return (
		<Text size="large" align="center" weight="bold">
			{`Amount to Pay: ${format(order.total || 0)}`}
		</Text>
	);
};

export default CheckoutTitle;