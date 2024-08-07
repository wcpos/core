import * as React from 'react';

import Box from '@wcpos/components/src/box';
import { ErrorBoundary } from '@wcpos/tailwind/src/error-boundary';
import { Suspense } from '@wcpos/tailwind/src/suspense';
import Text from '@wcpos/components/src/text';
import useTheme from '@wcpos/themes';

import SearchBar from './search-bar';
import UISettings from './ui-settings';

const TableContainer = ({ uiSettings }) => {
	const theme = useTheme();

	return (
		<Box
			raised
			rounding="medium"
			style={{ backgroundColor: 'white', flexGrow: 1, flexShrink: 1, flexBasis: '0%' }}
		>
			<Box
				horizontal
				space="small"
				padding="small"
				align="center"
				style={{
					backgroundColor: theme.colors.grey,
					borderTopLeftRadius: theme.rounding.medium,
					borderTopRightRadius: theme.rounding.medium,
				}}
			>
				<ErrorBoundary>
					<SearchBar />
				</ErrorBoundary>
				<ErrorBoundary>
					<UISettings uiSettings={uiSettings} />
				</ErrorBoundary>
			</Box>
			<Box style={{ flexGrow: 1, flexShrink: 1, flexBasis: '0%' }}>
				<ErrorBoundary>
					<Suspense>
						<Table uiSettings={uiSettings} />
					</Suspense>
				</ErrorBoundary>
			</Box>
		</Box>
	);
};

export default TableContainer;
