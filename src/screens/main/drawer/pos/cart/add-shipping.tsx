import * as React from 'react';

import Box from '@wcpos/components/src/box';
import Icon from '@wcpos/components/src/icon';
import Text from '@wcpos/components/src/text';

import { t } from '../../../../../lib/translations';

type OrderDocument = import('@wcpos/database').OrderDocument;

interface AddShippingProps {
	order: OrderDocument;
}

const AddShipping = ({ order }: AddShippingProps) => {
	const handleAddShipping = () => {
		order.update({
			$push: {
				shipping_lines: {
					method_title: 'Shipping',
					method_id: '0',
					total: '10',
				},
			},
		});
	};

	return (
		<Box horizontal space="small" padding="small" align="center">
			<Box fill>
				<Text>{t('Add Shipping', { _tags: 'core' })}</Text>
			</Box>
			<Box>
				<Icon name="circlePlus" onPress={handleAddShipping} />
			</Box>
		</Box>
	);
};

export default AddShipping;