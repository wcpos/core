import * as React from 'react';

import get from 'lodash/get';
import { useObservableState } from 'observable-hooks';

import Table, { TableExtraDataProps, CellRenderer } from '@wcpos/components/src/table';
import useWhyDidYouUpdate from '@wcpos/hooks/src/use-why-did-you-update';

import cells from './cells';
import Footer from './footer';
import { t } from '../../../lib/translations';
import TextCell from '../components/text-cell';
import useCustomers from '../contexts/customers';

type CustomerDocument = import('@wcpos/database').CustomerDocument;
type UISettingsColumn = import('../contexts/ui-settings').UISettingsColumn;

interface CustomersTableProps {
	uiSettings: import('../contexts/ui-settings').UISettingsDocument;
}

/**
 *
 */
const CustomersTable = ({ uiSettings }: CustomersTableProps) => {
	const { query$, setQuery, data: customers } = useCustomers();
	const query = useObservableState(query$, query$.getValue());
	const columns = useObservableState(
		uiSettings.get$('columns'),
		uiSettings.get('columns')
	) as UISettingsColumn[];

	/**
	 *
	 */
	const cellRenderer = React.useCallback<CellRenderer<CustomerDocument>>(
		({ item, column, index }) => {
			const Cell = get(cells, column.key, TextCell);
			return <Cell item={item} column={column} index={index} />;
		},
		[]
	);

	/**
	 *
	 */
	const context = React.useMemo<TableExtraDataProps<CustomerDocument>>(() => {
		return {
			columns: columns.filter((column) => column.show),
			sort: ({ sortBy, sortDirection }) => {
				setQuery('sortBy', sortBy);
				setQuery('sortDirection', sortDirection);
			},
			sortBy: query.sortBy,
			sortDirection: query.sortDirection,
			cellRenderer,
			headerLabel: ({ column }) => uiSettings.getLabel(column.key),
		};
	}, [columns, query.sortBy, query.sortDirection, cellRenderer, setQuery, uiSettings]);

	useWhyDidYouUpdate('Table', { customers });

	return (
		<Table<CustomerDocument>
			data={customers}
			footer={<Footer count={customers.length} />}
			estimatedItemSize={100}
			extraData={context}
		/>
	);
};

export default CustomersTable;