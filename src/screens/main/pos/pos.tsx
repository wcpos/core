import * as React from 'react';
import { useWindowDimensions } from 'react-native';

import { useTheme } from 'styled-components/native';

import { useQuery } from '@wcpos/query';
import { ErrorBoundary } from '@wcpos/tailwind/src/error-boundary';
import { Suspense } from '@wcpos/tailwind/src/suspense';

import POSColumns from './columns';
import { useCurrentOrder } from './contexts/current-order';
import POSTabs from './tabs';
import { TaxRatesProvider } from '../contexts/tax-rates';

/**
 *
 */
const POS = () => {
	const theme = useTheme();
	const dimensions = useWindowDimensions();
	const { currentOrder } = useCurrentOrder();

	/**
	 *
	 */
	const taxQuery = useQuery({
		queryKeys: ['tax-rates'],
		collectionName: 'taxes',
	});

	return (
		<>
			<ErrorBoundary>
				<TaxRatesProvider taxQuery={taxQuery} order={currentOrder}>
					<Suspense>
						{dimensions.width >= theme.screens.small ? <POSColumns /> : <POSTabs />}
					</Suspense>
				</TaxRatesProvider>
			</ErrorBoundary>
		</>
	);
};

export default POS;
