import * as React from 'react';

import { useObservableState } from 'observable-hooks';
import { useTheme } from 'styled-components/native';

import Box from '@wcpos/components/src/box';
import Dropdown from '@wcpos/components/src/dropdown';
import Icon from '@wcpos/components/src/icon';
import Text from '@wcpos/components/src/text';

import useStore from '../../../../contexts/store';
// import useCustomers from '@wcpos/hooks/src/use-customers';

interface CustomersFooterProps {
	count: number;
}

const CustomersFooter = ({ count }: CustomersFooterProps) => {
	const { storeDB } = useStore();
	const total = useObservableState(storeDB.customers.count().$, 0);
	const theme = useTheme();
	const [openMenu, setOpenMenu] = React.useState(false);
	// const { runReplication } = useCustomers();

	return (
		<Box
			horizontal
			padding="small"
			space="small"
			align="center"
			distribution="end"
			style={{
				backgroundColor: theme.colors.lightGrey,
				borderBottomLeftRadius: theme.rounding.medium,
				borderBottomRightRadius: theme.rounding.medium,
			}}
		>
			<Text size="small">
				Showing {count} of {total}
			</Text>
			<Dropdown
				opened={openMenu}
				onClose={() => {
					setOpenMenu(false);
				}}
				placement="top-end"
				items={[
					{
						label: 'Sync',
						action: () => {
							console.log('sync');
						},
						icon: 'arrowRotateRight',
					},
					{
						label: 'Clear and Refresh',
						action: () => {
							console.log('clear');
						},
						type: 'critical',
						icon: 'trash',
					},
				]}
				trigger="longpress"
			>
				<Icon
					name="arrowRotateRight"
					size="small"
					onPress={() => {
						console.log('sync');
					}}
					onLongPress={() => {
						setOpenMenu(true);
					}}
					tooltip="Press to sync, long press for more options"
					tooltipPlacement="top-end"
				/>
			</Dropdown>
		</Box>
	);
};

export default CustomersFooter;