import * as React from 'react';

import Icon from '@wcpos/components/src/icon';
import useSnackbar from '@wcpos/components/src/snackbar';

import { t } from '../../../../../../lib/translations';
import useCurrentOrder from '../../contexts/current-order';

interface ActionProps {
	item:
		| import('@wcpos/database').LineItemDocument
		| import('@wcpos/database').FeeLineDocument
		| import('@wcpos/database').ShippingLineDocument;
}

export const Actions = ({ item }: ActionProps) => {
	const { currentOrder, removeItem } = useCurrentOrder();
	const addSnackbar = useSnackbar();

	/**
	 *
	 */
	const undoRemove = React.useCallback(async () => {
		return currentOrder?.incrementalUpdate({
			$push: {
				[item.collection.name]: item.toJSON(),
			},
		});
	}, [currentOrder, item]);

	/**
	 *
	 */
	const handleRemove = React.useCallback(async () => {
		const name = item.name || item.method_title;
		await removeItem(item);

		// await currentOrder?.removeCartLine(item);

		addSnackbar({
			message: t('{name} removed from cart', { name, _tags: 'core' }),
			dismissable: true,
			action: { label: t('Undo', { _tags: 'core' }), action: undoRemove },
		});
	}, [addSnackbar, item, removeItem, undoRemove]);

	/**
	 *
	 */
	return <Icon name="circleXmark" size="xLarge" onPress={handleRemove} type="critical" />;
};