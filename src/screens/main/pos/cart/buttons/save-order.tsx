import * as React from 'react';

import { isRxDocument } from 'rxdb';

import { Button, ButtonText } from '@wcpos/tailwind/src/button';
import { Toast } from '@wcpos/tailwind/src/toast';

import { useT } from '../../../../../contexts/translations';
import usePushDocument from '../../../contexts/use-push-document';
import { useCurrentOrder } from '../../contexts/current-order';

/**
 *
 */
const SaveButton = () => {
	const { currentOrder } = useCurrentOrder();
	const pushDocument = usePushDocument();
	const [loading, setLoading] = React.useState(false);
	const t = useT();

	/**
	 *
	 */
	const handleSave = React.useCallback(async () => {
		setLoading(true);
		try {
			await pushDocument(currentOrder).then((savedDoc) => {
				/**
				 * TODO; move this geenric sanckbar to the pushDocument hook
				 */
				if (isRxDocument(savedDoc)) {
					Toast.show({
						text1: t('Order #{number} saved', { _tags: 'core', number: savedDoc.number }),
						type: 'success',
					});
				}
			});
		} catch (error) {
			Toast.show({
				text1: t('{message}', { _tags: 'core', message: error.message || 'Error' }),
				type: 'error',
			});
		} finally {
			setLoading(false);
		}
	}, [currentOrder, pushDocument, t]);

	/**
	 *
	 */
	return (
		<Button variant="outline" onPress={handleSave} loading={loading} disabled={loading}>
			<ButtonText numberOfLines={1}>{t('Save to Server', { _tags: 'core' })}</ButtonText>
		</Button>
	);
};

export default SaveButton;
