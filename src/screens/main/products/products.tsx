import * as React from 'react';

import { useTheme } from 'styled-components/native';

import Box from '@wcpos/components/src/box';
import ErrorBoundary from '@wcpos/components/src/error-boundary';
import Suspense from '@wcpos/components/src/suspense';
import { useRelationalQuery } from '@wcpos/query';

import SimpleProductTableRow from './rows/simple';
import VariableProductTableRow from './rows/variable';
import { useBarcode } from './use-barcode';
import { useT } from '../../../contexts/translations';
import DataTable from '../components/data-table';
import FilterBar from '../components/product/filter-bar';
import Search from '../components/product/search';
import TaxBasedOn from '../components/product/tax-based-on';
import UISettings from '../components/ui-settings';
import { useTaxHelpers } from '../contexts/tax-helpers';
import useUI from '../contexts/ui-settings';

type ProductDocument = import('@wcpos/database').ProductDocument;

// Table Rows
const TABLE_ROW_COMPONENTS = {
	simple: SimpleProductTableRow,
	variable: VariableProductTableRow,
};

/**
 *
 */
const Products = () => {
	const { uiSettings } = useUI('products');
	const theme = useTheme();
	const { calcTaxes } = useTaxHelpers();
	const t = useT();

	/**
	 *
	 */
	const { parentQuery: query } = useRelationalQuery(
		{
			queryKeys: ['products', { target: 'page', type: 'relational' }],
			collectionName: 'products',
			initialParams: {
				sortBy: uiSettings.get('sortBy'),
				sortDirection: uiSettings.get('sortDirection'),
			},
		},
		{
			queryKeys: ['variations', { target: 'page', type: 'relational' }],
			collectionName: 'variations',
			initialParams: {
				sortBy: 'id',
				sortDirection: uiSettings.get('sortDirection'),
			},
			endpoint: 'products/variations',
			greedy: true,
		}
	);

	/**
	 * Barcode
	 */
	useBarcode(query);

	/**
	 *
	 */
	const renderItem = React.useCallback((props) => {
		let Component = TABLE_ROW_COMPONENTS[props.item.document.type];

		// If we still didn't find a component, use SimpleProductTableRow as a fallback
		// eg: Grouped products
		if (!Component) {
			Component = SimpleProductTableRow;
		}

		return (
			<ErrorBoundary>
				<Component {...props} />
			</ErrorBoundary>
		);
	}, []);

	/**
	 *
	 */
	return (
		<Box padding="small" style={{ height: '100%' }}>
			<Box
				raised
				rounding="medium"
				style={{ backgroundColor: 'white', flexGrow: 1, flexShrink: 1, flexBasis: '0%' }}
			>
				<Box
					horizontal
					style={{
						backgroundColor: theme.colors.grey,
						borderTopLeftRadius: theme.rounding.medium,
						borderTopRightRadius: theme.rounding.medium,
					}}
				>
					<Box fill space="small">
						<Box horizontal align="center" padding="small" paddingBottom="none" space="small">
							<ErrorBoundary>
								<Search query={query} />
							</ErrorBoundary>
							<ErrorBoundary>
								{/* <Icon
						name="plus"
						onPress={() => navigation.navigate('AddProduct')}
						tooltip={t('Add new customer', { _tags: 'core' })}
					/> */}
								<UISettings
									uiSettings={uiSettings}
									title={t('Product Settings', { _tags: 'core' })}
								/>
							</ErrorBoundary>
						</Box>
						<Box horizontal padding="small" paddingTop="none">
							<ErrorBoundary>
								<FilterBar query={query} />
							</ErrorBoundary>
						</Box>
					</Box>
				</Box>
				<Box style={{ flexGrow: 1, flexShrink: 1, flexBasis: '0%' }}>
					<ErrorBoundary>
						<Suspense>
							<DataTable<ProductDocument>
								query={query}
								uiSettings={uiSettings}
								renderItem={renderItem}
								noDataMessage={t('No products found', { _tags: 'core' })}
								estimatedItemSize={100}
								extraContext={{ taxLocation: 'base' }}
								footer={
									calcTaxes && (
										<Box fill padding="small" space="xSmall" horizontal>
											<TaxBasedOn taxBasedOn="base" />
										</Box>
									)
								}
							/>
						</Suspense>
					</ErrorBoundary>
				</Box>
			</Box>
		</Box>
	);
};

export default Products;
