import * as React from 'react';

import Box from '@wcpos/components/src/box';
import { EdittableText } from '@wcpos/components/src/edittable-text';

import { EditButton } from './edit-button';
import { EditShippingLineModal } from './edit-shipping-line';
import { useUpdateShippingLine } from '../../hooks/use-update-shipping-line';

type ShippingLine = import('@wcpos/database').OrderDocument['shipping_lines'][number];
interface Props {
	uuid: string;
	item: ShippingLine;
	column: import('@wcpos/tailwind/src/table').ColumnProps<ShippingLine>;
}

/**
 *
 */
export const ShippingTitle = ({ uuid, item }: Props) => {
	const { updateShippingLine } = useUpdateShippingLine();

	return (
		<Box horizontal space="xSmall" style={{ width: '100%' }}>
			<Box fill>
				<EdittableText
					weight="bold"
					onChange={(method_title) => updateShippingLine(uuid, { method_title })}
				>
					{item.method_title}
				</EdittableText>
			</Box>
			<Box distribution="center">
				<EditButton uuid={uuid} item={item} Modal={EditShippingLineModal} />
			</Box>
		</Box>
	);
};
