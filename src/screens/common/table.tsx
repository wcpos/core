import * as React from 'react';
import { useObservableState } from 'observable-hooks';
import { useTranslation } from 'react-i18next';
import Table from '@wcpos/common/src/components/table';
import useWhyDidYouUpdate from '@wcpos/common/src/hooks/use-why-did-you-update';

type Sort = import('@wcpos/common/src/components/table/types').Sort;
type SortDirection = import('@wcpos/common/src/components/table/types').SortDirection;

interface CommonTableProps {
	collectionName: 'products' | 'customers' | 'orders';
	columns: any;
	data$: any;
	setQuery: any;
	sortBy: string;
	sortDirection: SortDirection;
	RowComponent: React.FunctionComponent<{ item: any; columns: any }>;
}

type GetHeaderCellPropsFunction =
	import('@wcpos/common/src/components/table/header-row').GetHeaderCellPropsFunction;

/**
 *
 */
const CommonTable = ({
	collectionName,
	columns,
	data$,
	setQuery,
	sortBy: _sortBy,
	sortDirection: _sortDirection,
	RowComponent,
}: CommonTableProps) => {
	const { t } = useTranslation();
	const data = useObservableState(data$, []);
	// const syncState = React.useRef<number[]>([]);

	const handleSort: Sort = React.useCallback(
		({ sortBy, sortDirection }) => {
			// @ts-ignore
			setQuery((prev) => ({ ...prev, sortBy, sortDirection }));
		},
		[setQuery]
	);

	// const handleVieweableItemsChanged = React.useCallback(({ changed }) => {
	// 	forEach(changed, ({ item, isViewable }) => {
	// 		if (isViewable && !item.isSynced() && !syncingCustomers.current.includes(item.id)) {
	// 			syncingCustomers.current.push(item.id);
	// 			const replicationState = item.syncRestApi({
	// 				pull: {},
	// 			});
	// 			replicationState.run(false);
	// 		}
	// 	});
	// }, []);

	// const getItemLayout = React.useCallback(
	// 	(data, index) => ({ length: 100, offset: 100 * index, index }),
	// 	[]
	// );

	useWhyDidYouUpdate('Common Table', {
		collectionName,
		columns,
		data,
		setQuery,
		_sortBy,
		_sortDirection,
		RowComponent,
		// syncingCustomers,
		t,
	});

	return (
		<Table
			columns={columns}
			data={data}
			sort={handleSort}
			sortBy={_sortBy}
			sortDirection={_sortDirection}
			// // @ts-ignore
			// onViewableItemsChanged={handleVieweableItemsChanged}
			// // @ts-ignore
			// getItemLayout={getItemLayout}
		>
			<Table.Header>
				<Table.Header.Row>
					{({ getHeaderCellProps }: { getHeaderCellProps: GetHeaderCellPropsFunction }) => {
						const { column } = getHeaderCellProps();
						return (
							<Table.Header.Row.Cell {...getHeaderCellProps()}>
								{t(`${collectionName}.column.label.${column.key}`)}
							</Table.Header.Row.Cell>
						);
					}}
				</Table.Header.Row>
			</Table.Header>
			<Table.Body>
				{({ item }: { item: any }) => <RowComponent item={item} columns={columns} />}
			</Table.Body>
		</Table>
	);
};

export default React.memo(CommonTable);