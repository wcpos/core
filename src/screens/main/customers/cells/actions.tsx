import * as React from 'react';

import { useNavigation } from '@react-navigation/native';

import Dropdown from '@wcpos/components/src/dropdown';
import Icon from '@wcpos/components/src/icon';

import { t } from '../../../../lib/translations';
import useRestHttpClient from '../../hooks/use-rest-http-client';

type Props = {
	item: import('@wcpos/database').CustomerDocument;
};

const Actions = ({ item: customer }: Props) => {
	const http = useRestHttpClient();
	const navigation = useNavigation();
	const [menuOpened, setMenuOpened] = React.useState(false);

	/**
	 *
	 */
	const handleSync = async () => {
		// push
		const result = await http.post(`customers/${customer.id}`, customer.toJSON());
		if (result && result.data) {
			// parse raw data
			const data = customer.collection.parseRestResponse(result.data);
			customer.atomicPatch(data);
		}
	};

	/**
	 *
	 */
	const handleDelete = () => {
		customer.remove();
	};

	return (
		<>
			<Dropdown
				opened={menuOpened}
				onClose={() => {
					setMenuOpened(false);
				}}
				withinPortal={true}
				placement="bottom-end"
				items={[
					{
						label: t('Edit', { _tags: 'core' }),
						action: () => navigation.navigate('EditCustomer', { customerID: customer.uuid }),
						icon: 'penToSquare',
					},
					{ label: t('Sync', { _tags: 'core' }), action: handleSync, icon: 'arrowRotateRight' },
					{ label: '__' },
					{
						label: t('Delete', { _tags: 'core' }),
						action: () => {
							console.log('delete');
						},
						icon: 'trash',
						type: 'critical',
					},
				]}
			>
				<Icon
					name="ellipsisVertical"
					onPress={() => {
						setMenuOpened(true);
					}}
				/>
			</Dropdown>
		</>
	);
};

export default Actions;