import * as React from 'react';

import find from 'lodash/find';
import pick from 'lodash/pick';
import { useObservableState } from 'observable-hooks';

import Box from '@wcpos/components/src/box';
import Text from '@wcpos/components/src/text';

import { EditButton } from './edit-button';
import { t } from '../../../../../../lib/translations';

type LineItemDocument = import('@wcpos/database').LineItemDocument;
interface Props {
	item: LineItemDocument;
	column: import('@wcpos/components/src/table').ColumnProps<LineItemDocument>;
}

export const ProductName = ({ item, column }: Props) => {
	const name = useObservableState(item.name$, item.name);
	const metaData = useObservableState(item.meta_data$, item.meta_data) || [];
	const { display } = column;

	/**
	 *
	 */
	const show = React.useCallback(
		(key: string): boolean => {
			const d = find(display, { key });
			return !!(d && d.show);
		},
		[display]
	);

	/**
	 *  filter out the private meta data
	 */
	const attributes = metaData.filter((meta) => {
		if (meta.key) {
			return !meta.key.startsWith('_');
		}
		return true;
	});

	/**
	 *  filter schema for edit form
	 */
	const schema = React.useMemo(() => {
		return {
			...item.collection.schema.jsonSchema,
			properties: pick(item.collection.schema.jsonSchema.properties, [
				'name',
				'sku',
				'price',
				'quantity',
				'tax_class',
				'subtotal',
				'subtotal_tax',
				'total',
				'total_tax',
				'taxes',
				'meta_data',
			]),
		};
	}, [item.collection.schema.jsonSchema]);

	/**
	 *  uiSchema
	 */
	const uiSchema = React.useMemo(
		() => ({
			taxes: { 'ui:collapsible': 'closed', 'ui:title': t('Taxes', { _tags: 'core' }) },
			meta_data: { 'ui:collapsible': 'closed', 'ui:title': t('Meta Data', { _tags: 'core' }) },
		}),
		[]
	);

	/**
	 *
	 */
	return (
		<Box horizontal space="xSmall" style={{ width: '100%' }}>
			<Box fill space="xSmall" style={{ flex: 1 }}>
				<Text>{name}</Text>
				{show('sku') && <Text size="small">{item.sku}</Text>}

				{attributes.map((meta) => {
					return (
						<Box space="xxSmall" key={meta.display_key || meta.key} horizontal>
							<Text size="small" type="secondary">{`${meta.display_key || meta.key}:`}</Text>
							<Text size="small">{meta.display_value || meta.value}</Text>
						</Box>
					);
				})}
			</Box>
			<Box distribution="center">
				<EditButton schema={schema} uiSchema={uiSchema} item={item} />
			</Box>
		</Box>
	);
};