import * as React from 'react';

import pick from 'lodash/pick';

import { useCustomers } from '../../../../contexts/customers/use-customers';
import EditForm from '../../common/edit-form';

const EditCustomer = () => {
	const { data: customer } = useCustomers();

	/**
	 *
	 */
	const schema = React.useMemo(() => {
		return {
			...customer.collection.schema.jsonSchema,
			properties: pick(customer.collection.schema.jsonSchema.properties, [
				'id',
				'email',
				'first_name',
				'last_name',
				'role',
				'username',
				'billing',
				'shipping',
				'meta_data',
			]),
		};
	}, [customer.collection.schema.jsonSchema]);

	if (!customer) {
		return null;
	}

	return (
		<EditForm
			item={customer}
			schema={schema}
			// uiSchema={}
		/>
	);
};

export default EditCustomer;