import * as React from 'react';

import get from 'lodash/get';
import pick from 'lodash/pick';
import { useObservableState } from 'observable-hooks';

import Box from '@wcpos/components/src/box';
import Modal from '@wcpos/components/src/modal';
import Pill from '@wcpos/components/src/pill';
import Text from '@wcpos/components/src/text';
import Form from '@wcpos/react-native-jsonschema-form';
import log from '@wcpos/utils/src/logger';

import { useT } from '../../../../contexts/translations';
import { CountrySelect, StateSelect } from '../../components/country-state-select';
import useCustomerNameFormat from '../../hooks/use-customer-name-format';
import { useCurrentOrder } from '../contexts/current-order';

/**
 *
 */
const Customer = ({ setShowCustomerSelect }) => {
	const [editModalOpened, setEditModalOpened] = React.useState(false);
	const { currentOrder } = useCurrentOrder();
	const billing = useObservableState(currentOrder.billing$, currentOrder.billing);
	const shipping = useObservableState(currentOrder.shipping$, currentOrder.shipping);
	const customer_id = useObservableState(currentOrder.customer_id$, currentOrder.customer_id);
	const { format } = useCustomerNameFormat();
	const name = format({ billing, shipping, id: customer_id });
	const billingCountry = get(billing, ['country']);
	const shippingCountry = get(shipping, ['country']);
	const t = useT();

	/**
	 *
	 */
	const handleSaveCustomer = React.useCallback(
		async (newData) => {
			try {
				await currentOrder.incrementalPatch(newData);
			} catch (error) {
				log.error(error);
			}
		},
		[currentOrder]
	);

	/**
	 *
	 */
	const schema = React.useMemo(() => {
		const _schema = {
			...currentOrder.collection.schema.jsonSchema,
			properties: pick(currentOrder.collection.schema.jsonSchema.properties, [
				'billing',
				'shipping',
			]),
		};

		return _schema;
	}, [currentOrder.collection.schema.jsonSchema]);

	/**
	 *
	 */
	const uiSchema = React.useMemo(() => {
		return {
			'ui:title': null,
			'ui:description': null,
			billing: {
				'ui:title': t('Billing Address', { _tags: 'core' }),
				'ui:description': null,
				'ui:collapsible': 'opened',
				'ui:order': [
					'first_name',
					'last_name',
					'email',
					'company',
					'phone',
					'address_1',
					'address_2',
					'city',
					'postcode',
					'state',
					'country',
				],
				first_name: {
					'ui:label': t('First Name', { _tags: 'core' }),
				},
				last_name: {
					'ui:label': t('Last Name', { _tags: 'core' }),
				},
				email: {
					'ui:label': t('Email', { _tags: 'core' }),
				},
				address_1: {
					'ui:label': t('Address 1', { _tags: 'core' }),
				},
				address_2: {
					'ui:label': t('Address 2', { _tags: 'core' }),
				},
				city: {
					'ui:label': t('City', { _tags: 'core' }),
				},
				state: {
					'ui:label': t('State', { _tags: 'core' }),
					'ui:widget': (props) => <StateSelect country={billingCountry} {...props} />,
				},
				postcode: {
					'ui:label': t('Postcode', { _tags: 'core' }),
				},
				country: {
					'ui:label': t('Country', { _tags: 'core' }),
					'ui:widget': CountrySelect,
				},
				company: {
					'ui:label': t('Company', { _tags: 'core' }),
				},
				phone: {
					'ui:label': t('Phone', { _tags: 'core' }),
				},
			},
			shipping: {
				'ui:title': t('Shipping Address', { _tags: 'core' }),
				'ui:description': null,
				'ui:collapsible': 'closed',
				'ui:order': [
					'first_name',
					'last_name',
					'company',
					'address_1',
					'address_2',
					'city',
					'postcode',
					'state',
					'country',
				],
				first_name: {
					'ui:label': t('First Name', { _tags: 'core' }),
				},
				last_name: {
					'ui:label': t('Last Name', { _tags: 'core' }),
				},
				address_1: {
					'ui:label': t('Address 1', { _tags: 'core' }),
				},
				address_2: {
					'ui:label': t('Address 2', { _tags: 'core' }),
				},
				city: {
					'ui:label': t('City', { _tags: 'core' }),
				},
				state: {
					'ui:label': t('State', { _tags: 'core' }),
					'ui:widget': (props) => <StateSelect country={shippingCountry} {...props} />,
				},
				postcode: {
					'ui:label': t('Postcode', { _tags: 'core' }),
				},
				country: {
					'ui:label': t('Country', { _tags: 'core' }),
					'ui:widget': CountrySelect,
				},
				company: {
					'ui:label': t('Company', { _tags: 'core' }),
				},
			},
		};
	}, [billingCountry, shippingCountry, t]);

	/**
	 *
	 */
	return (
		<Box horizontal align="center" space="small">
			<Text weight="bold">{t('Customer', { _tags: 'core' })}:</Text>
			<Pill
				removable
				onRemove={() => {
					setShowCustomerSelect(true);
				}}
				onPress={() => setEditModalOpened(true)}
			>
				{name}
			</Pill>

			<Modal
				size="large"
				opened={editModalOpened}
				onClose={() => setEditModalOpened(false)}
				title={t('Edit Customer Address', { _tags: 'core' })}
			>
				<Form
					formData={{ billing, shipping }}
					schema={schema}
					uiSchema={uiSchema}
					onChange={handleSaveCustomer}
				/>
			</Modal>
		</Box>
	);
};

export default Customer;
