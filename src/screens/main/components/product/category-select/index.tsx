import * as React from 'react';

import Popover from '@wcpos/components/src/popover';
import { useQuery } from '@wcpos/query';

import Menu from './menu';
import SearchInput from './search-input';

/**
 *
 */
const CategorySelectSearch = ({ onBlur, onSelect }) => {
	const [opened, setOpened] = React.useState(false);

	/**
	 *
	 */
	const query = useQuery({
		queryKeys: ['products/categories'],
		collectionName: 'products/categories',
		initialParams: {
			sortBy: 'name',
			sortDirection: 'asc',
		},
	});

	/**
	 *
	 */
	const onSearch = React.useCallback(
		(search) => {
			query.debouncedSearch(search);
		},
		[query]
	);

	/**
	 * Reset search when unmounting
	 */
	React.useEffect(() => {
		return () => {
			onSearch('');
		};
	}, [onSearch]);

	/**
	 *
	 */
	return (
		<Popover
			opened={opened}
			//onOpen={() => setOpened(true)}
			onClose={() => {
				setOpened(false);
			}}
			withArrow={false}
			matchWidth
			withinPortal={false}
		>
			<Popover.Target>
				<SearchInput setOpened={setOpened} onBlur={onBlur} onSearch={onSearch} />
			</Popover.Target>
			<Popover.Content style={{ paddingLeft: 0, paddingRight: 0, maxHeight: 300 }}>
				<Menu query={query} onSelect={onSelect} />
			</Popover.Content>
		</Popover>
	);
};

export default CategorySelectSearch;
