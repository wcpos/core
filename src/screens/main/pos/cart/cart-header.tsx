import * as React from 'react';
import { useObservableState } from 'observable-hooks';
import { useTheme } from 'styled-components/native';
import Box from '@wcpos/components/src/box';
import useStore from '@wcpos/hooks/src/use-store';
import ErrorBoundary from '@wcpos/components/src/error-boundary';
import useWhyDidYouUpdate from '@wcpos/hooks/src/use-why-did-you-update';
import CustomerSelect from '../../common/customer-select';
import AddCustomer from '../../common/add-new-customer';
import UISettings from '../../common/ui-settings';
import Customer from './customer';

type OrderDocument = import('@wcpos/database').OrderDocument;

interface CartHeaderProps {
	order: OrderDocument;
	ui: any;
}

/**
 *
 */
const CartHeader = ({ order, ui }: CartHeaderProps) => {
	const theme = useTheme();
	const { storeDB } = useStore();
	const customerID = useObservableState(order.customer_id$, order.customer_id);

	/**
	 *
	 */
	const handleCustomerSelect = React.useCallback(
		async ({ value: selectedCustomer }) => {
			const billingEmail = selectedCustomer?.billing?.email || selectedCustomer?.email;
			const firstName = selectedCustomer?.billing?.first_name || selectedCustomer?.username;

			await order.atomicPatch({
				customer_id: selectedCustomer.id,
				billing: { ...selectedCustomer.billing, email: billingEmail, first_name: firstName },
				shipping: selectedCustomer.shipping,
			});
		},
		[order]
	);

	/**
	 *
	 */
	useWhyDidYouUpdate('Cart Header', { order, ui, theme, storeDB });

	/**
	 *
	 */
	return (
		<Box
			horizontal
			space="small"
			padding="small"
			align="center"
			style={{
				backgroundColor: theme.colors.grey,
				borderTopLeftRadius: theme.rounding.medium,
				borderTopRightRadius: theme.rounding.medium,
				height: 51,
			}}
		>
			<Box fill>
				<ErrorBoundary>
					{customerID !== -1 ? (
						<Customer order={order} />
					) : (
						<CustomerSelect onSelectCustomer={handleCustomerSelect} />
					)}
				</ErrorBoundary>
			</Box>
			<AddCustomer />
			<UISettings ui={ui} />
		</Box>
	);
};

export default CartHeader;