import * as React from 'react';
import { OrdersProvider } from '@wcpos/hooks/src/use-orders';
import Text from '@wcpos/components/src/text';
import CartTabs from './tabs';

const OpenOrders = () => {
	return (
		<React.Suspense fallback={<Text>test 2</Text>}>
			<OrdersProvider
				initialQuery={{
					sortBy: 'date_created_gmt',
					sortDirection: 'desc',
					filters: { status: 'pos-open' },
				}}
			>
				<CartTabs />
			</OrdersProvider>
		</React.Suspense>
	);
};

export default React.memo(OpenOrders);