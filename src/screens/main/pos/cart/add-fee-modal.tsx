import * as React from 'react';

import isEmpty from 'lodash/isEmpty';
import { useObservableEagerState } from 'observable-hooks';

import Box from '@wcpos/components/src/box';
import Modal from '@wcpos/components/src/modal';
import Form from '@wcpos/react-native-jsonschema-form';

import { useAppState } from '../../../../contexts/app-state';
import { useT } from '../../../../contexts/translations';
import { AmountWidget } from '../../components/amount-widget';
import { useTaxRates } from '../../contexts/tax-rates';
import { useCurrentOrder } from '../contexts/current-order';
import { useAddFee } from '../hooks/use-add-fee';

/**
 * TODO: tax_status = taxable by default, perhaps put this as setting?
 */
const initialData = {
	name: '',
	tax_status: 'taxable',
	tax_class: 'standard',
	meta_data: [],
};

/**
 *
 */
export const AddFeeModal = ({ onClose }: { onClose: () => void }) => {
	const [data, setData] = React.useState(initialData);
	const { currentOrder } = useCurrentOrder();
	const { addFee } = useAddFee();
	const currencySymbol = useObservableEagerState(currentOrder.currency_symbol$);
	const t = useT();
	const { store } = useAppState();
	const pricesIncludeTax = useObservableEagerState(store.prices_include_tax$);
	const amountDataRef = React.useRef({ amount: '0', percent: false });
	const { taxClasses } = useTaxRates();

	/**
	 *
	 */
	const handleClose = React.useCallback(() => {
		setData(initialData);
		amountDataRef.current = { amount: '0', percent: false };
		onClose();
	}, [onClose]);

	/**
	 *
	 */
	const handleAddFee = React.useCallback(async () => {
		const { name, tax_status, tax_class, meta_data } = data;
		await addFee({
			name: isEmpty(name) ? t('Fee', { _tags: 'core' }) : name,
			// total: isEmpty(total) ? '0' : total,
			amount: amountDataRef.current.amount,
			tax_status,
			tax_class,
			meta_data,
			percent: amountDataRef.current.percent,
			prices_include_tax: isEmpty(data.prices_include_tax)
				? pricesIncludeTax === 'yes'
				: data.prices_include_tax,
		});
		onClose();
	}, [addFee, data, onClose, pricesIncludeTax, t]);

	/**
	 *
	 */
	const schema = React.useMemo(
		() => ({
			type: 'object',
			properties: {
				name: { type: 'string', title: t('Fee Name', { _tags: 'core' }) },
				// total: { type: 'string', title: t('Total', { _tags: 'core' }) },
				amount: { type: 'string', title: t('Amount', { _tags: 'core' }) },
				prices_include_tax: {
					type: 'boolean',
					title: t('Amount Includes Tax', { _tags: 'core' }),
					default: pricesIncludeTax === 'yes',
				},
				tax_status: {
					type: 'string',
					title: t('Tax Status', { _tags: 'core' }),
					enum: ['taxable', 'none'],
					default: 'taxable',
				},
				tax_class: {
					type: 'string',
					title: t('Tax Class', { _tags: 'core' }),
					enum: taxClasses,
					default: taxClasses.includes('standard') ? 'standard' : taxClasses[0],
				},
				meta_data: {
					type: 'array',
					title: t('Meta Data', { _tags: 'core' }),
					items: {
						type: 'object',
						properties: {
							key: {
								description: 'Meta key.',
								type: 'string',
							},
							value: {
								description: 'Meta value.',
								type: 'string',
							},
						},
					},
				},
			},
		}),
		[pricesIncludeTax, t, taxClasses]
	);

	/**
	 *
	 */
	const uiSchema = React.useMemo(
		() => ({
			amount: {
				'ui:widget': () => (
					<AmountWidget
						amount={amountDataRef.current.amount}
						percent={amountDataRef.current.percent}
						currencySymbol={currencySymbol}
						onChange={(changes) => {
							amountDataRef.current = { ...amountDataRef.current, ...changes };
						}}
					/>
				),
			},
			name: {
				'ui:placeholder': t('Fee', { _tags: 'core' }),
			},
		}),
		[currencySymbol, t]
	);

	/**
	 *
	 */
	return (
		<Modal
			opened
			onClose={handleClose}
			title={t('Add Fee', { _tags: 'core' })}
			primaryAction={{
				label: t('Add to Cart', { _tags: 'core' }),
				action: handleAddFee,
			}}
			secondaryActions={[{ label: t('Cancel', { _tags: 'core' }), action: handleClose }]}
		>
			<Box space="small">
				<Form
					formData={data}
					schema={schema}
					uiSchema={uiSchema}
					onChange={({ formData }) => {
						setData(formData);
					}}
				/>
			</Box>
		</Modal>
	);
};