import * as React from 'react';
import pick from 'lodash/pick';
import { decode } from 'html-entities';
import Form from '@wcpos/react-native-jsonschema-form';
import useStore from '@wcpos/hooks/src/use-store';

const uiSchema = {};

export const GeneralSettings = () => {
	const { store } = useStore();

	/**
	 *
	 */
	const schema = React.useMemo(() => {
		const _schema = {
			...store?.collection.schema.jsonSchema,
			properties: pick(store?.collection.schema.jsonSchema.properties, [
				'name',
				// 'store_address',
				// 'store_address_2',
				// 'store_city',
				// 'default_country',
				// 'store_postcode',
				// 'enable_coupons',
				// 'calc_discounts_sequentially',
				'currency',
				'currency_pos',
				'price_thousand_sep',
				'price_decimal_sep',
				'price_num_decimals',
			]),
		};

		// fix html entities for currency
		// _schema.properties.currency.enumNames = _schema.properties.currency.enumNames.map(decode);

		return _schema;
	}, [store?.collection.schema.jsonSchema]);

	/**
	 *
	 */
	const handleOnChange = React.useCallback(
		(data) => {
			store?.atomicPatch(data);
		},
		[store]
	);

	/**
	 *
	 */
	return (
		<Form schema={schema} uiSchema={uiSchema} formData={store.toJSON()} onChange={handleOnChange} />
	);
};