import * as React from 'react';

// import validator from '@rjsf/validator-ajv8';
import get from 'lodash/get';
import { useObservableState } from 'observable-hooks';

import Icon from '@wcpos/components/src/icon';
import Modal, { useModal } from '@wcpos/components/src/modal';
import Form from '@wcpos/react-native-jsonschema-form';
// import Form from '@wcpos/rjsf-native';

import { t } from '../../../../lib/translations';

interface POSProductSettingsProps {
	ui: import('../../../../contexts/ui').UIDocument;
}

/**
 *
 */
const schema = {
	title: 'Cart Table Settings',
	type: 'object',
	properties: {
		columns: {
			// uniqueItems: false,
			title: 'Table Columns',
			type: 'array',
			items: {
				type: 'object',
				properties: {
					show: {
						type: 'boolean',
					},
					display: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								show: {
									type: 'boolean',
								},
							},
						},
					},
				},
			},
		},
	},
};

/**
 *
 */
const uiSchema = {
	columns: {
		'ui:options': {
			removable: false,
			addable: false,
		},
		items: {
			display: {
				'ui:options': {
					removable: false,
					addable: false,
				},
			},
		},
	},
};

/**
 *
 */
export const POSProductSettings = ({ ui }: POSProductSettingsProps) => {
	const { ref, open, close } = useModal();
	const showOutOfStock = useObservableState(ui.get$('showOutOfStock'), ui.get('showOutOfStock'));
	const columns = useObservableState(ui.get$('columns'), ui.get('columns'));

	/**
	 * Translate column key into label
	 */
	const label = React.useCallback(
		(id, label) => {
			const path = id.split('.').slice(2, -1);
			const key = get(columns, path.concat('key'), null);

			// root level
			if (!key) {
				switch (label) {
					default:
						return label;
				}
			}

			switch (key) {
				// case 'image':
				// 	return t('Image');
				// case 'name':
				// 	return t('Product');
				// case 'stock_quantity':
				// 	return t('Stock');
				// case 'sku':
				// 	return t('SKU');
				// case 'categories':
				// 	return t('Categories');
				// case 'tags':
				// 	return t('Tags');
				// case 'type':
				// 	return t('Type');
				// case 'price':
				// 	return t('Price');
				// case 'tax':
				// 	return t('Tax');
				// case 'actions':
				// 	return t('Actions');
				default:
					return t('No label found');
			}
		},
		[columns]
	);

	/**
	 *
	 */
	return (
		<>
			<Icon name="sliders" onPress={open} />
			<Modal
				ref={ref}
				title="Cart UI Settings"
				// primaryAction={{ label: 'Save', action: close }}
				// secondaryActions={[{ label: 'Restore Defaults', action: ui.reset, type: 'critical' }]}
				primaryAction={{ label: 'Restore Defaults', action: ui.reset, type: 'critical' }}
			>
				<Form
					schema={schema}
					uiSchema={uiSchema}
					formData={{ showOutOfStock, columns }}
					onChange={(value) => {
						// debugger;
						ui.atomicPatch(value);
					}}
					formContext={{ label }}
					// validator={validator}
				/>
			</Modal>
		</>
	);
};

export default POSProductSettings;