import * as React from 'react';
import { useObservableState } from 'observable-hooks';
import { useTranslation } from 'react-i18next';
import useCustomers from '@wcpos/core/src/contexts/customers';
import useWhyDidYouUpdate from '@wcpos/hooks/src/use-why-did-you-update';
import Table, { TableExtraDataProps, CellRenderer } from '@wcpos/components/src/table';
import Footer from './footer';
import cells from './cells';

type CustomerDocument = import('@wcpos/database').CustomerDocument;
type UIColumn = import('@wcpos/hooks/src/use-store').UIColumn;

interface CustomersTableProps {
	ui: import('@wcpos/hooks/src/use-store').UIDocument;
}

/**
 *
 */
const CustomersTable = ({ ui }: CustomersTableProps) => {
	const { t } = useTranslation();
	const { query$, setQuery, data: customers } = useCustomers();
	const query = useObservableState(query$, query$.getValue());
	const columns = useObservableState(ui.get$('columns'), ui.get('columns')) as UIColumn[];

	/**
	 *
	 */
	const cellRenderer = React.useCallback<CellRenderer<CustomerDocument>>(
		({ item, column, index }) => {
			const Cell = cells[column.key];
			return Cell ? <Cell item={item} column={column} index={index} /> : null;
		},
		[]
	);

	/**
	 *
	 */
	const headerLabel = React.useCallback(
		({ column }) => {
			return t(`customers.column.label.${column.key}`);
		},
		[t]
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
			headerLabel,
		};
	}, [columns, query.sortBy, query.sortDirection, setQuery, cellRenderer, headerLabel]);

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