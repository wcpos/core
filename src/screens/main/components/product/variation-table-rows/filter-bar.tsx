import * as React from 'react';

import get from 'lodash/get';
import { useObservableEagerState, useObservableState } from 'observable-hooks';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { useTheme } from 'styled-components/native';

import Box from '@wcpos/components/src/box';
import Icon from '@wcpos/components/src/icon';

import AttributePill from './attribute-pill';
import { useVariationTable } from './context';
import { VariationSearchPill } from './search-pill';

type ProductDocument = import('@wcpos/database').ProductDocument;
type ProductCollection = import('@wcpos/database').ProductCollection;
type Query = import('@wcpos/query').Query<ProductCollection>;

interface Props {
	parent: ProductDocument;
	query: Query;
	parentSearchTerm?: string;
}

/**
 *
 */
const VariationsFilterBar = ({ parent, query, parentSearchTerm }: Props) => {
	const theme = useTheme();
	const { setExpanded } = useVariationTable();

	// new array is being created every time
	const selectedAttributes = useObservableEagerState(
		query.params$.pipe(
			map(() => query.findSelector('attributes')),
			distinctUntilChanged((prev, next) => {
				const test = JSON.stringify(prev) === JSON.stringify(next);
				debugger;
				return test;
			})
		)
	);
	console.log('selectedAttributes', selectedAttributes);

	/**
	 *
	 */
	const handleSelect = React.useCallback(
		(attribute) => {
			query.where('attributes', { $elemMatch: { name: attribute.name, option: attribute.option } });
		},
		[query]
	);

	/**
	 *
	 */
	const handleSearch = React.useCallback(
		(search: string) => {
			query.debouncedSearch(search);
		},
		[query]
	);

	/**
	 *
	 */
	React.useEffect(() => {
		if (parentSearchTerm) {
			query.search(parentSearchTerm);
		}
	}, [parentSearchTerm, query]);

	/**
	 *
	 */
	return (
		<Box
			horizontal
			align="center"
			padding="small"
			style={{
				backgroundColor: theme.colors.grey,
			}}
		>
			<Box fill horizontal space="small" style={{ flexWrap: 'wrap', width: '100%' }}>
				<VariationSearchPill onSearch={handleSearch} parentSearchTerm={parentSearchTerm} />
				{(parent.attributes || [])
					.filter((attribute) => attribute.variation)
					.sort((a, b) => (a.position || 0) - (b.position || 0))
					.map((attribute, index) => {
						let selected;
						if (Array.isArray(selectedAttributes)) {
							selected = selectedAttributes.find((a) => a.name === attribute.name);
						}
						return (
							<AttributePill
								key={`${index}-${attribute.name}`}
								attribute={attribute}
								onSelect={handleSelect}
								selected={selected?.option}
							/>
						);
					})}
			</Box>
			<Box>
				<Icon name="chevronUp" size="small" onPress={() => setExpanded(false)} />
			</Box>
		</Box>
	);
};

export default React.memo(VariationsFilterBar);
