import * as React from 'react';

import { isRxDocument } from 'rxdb';

import Button from '@wcpos/components/src/button';
import { useSnackbar } from '@wcpos/components/src/snackbar/use-snackbar';
import log from '@wcpos/utils/src/logger';

import { useT } from '../../../../../contexts/translations';
import usePushDocument from '../../../contexts/use-push-document';
import { useCurrentOrder } from '../../contexts/current-order';

const SaveButton = () => {
	const { currentOrder } = useCurrentOrder();
	const pushDocument = usePushDocument();
	const [loading, setLoading] = React.useState(false);
	const addSnackbar = useSnackbar();
	const t = useT();

	return (
		<Button
			title={t('Save to Server', { _tags: 'core' })}
			background="outline"
			onPress={async () => {
				setLoading(true);
				try {
					await pushDocument(currentOrder).then((savedDoc) => {
						/**
						 * TODO; move this geenric sanckbar to the pushDocument hook
						 */
						if (isRxDocument(savedDoc)) {
							addSnackbar({
								message: t('Order #{number} saved', { _tags: 'core', number: savedDoc.number }),
							});
						}
					});
				} catch (error) {
					addSnackbar({
						message: t('{message}', { _tags: 'core', message: error.message || 'Error' }),
					});
				} finally {
					setLoading(false);
				}
			}}
			style={{ flex: 1 }}
			loading={loading}
		/>
	);
};

export default SaveButton;
