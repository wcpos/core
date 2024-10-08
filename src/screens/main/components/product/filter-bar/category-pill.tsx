import * as React from 'react';

import { useObservableSuspense, ObservableResource } from 'observable-hooks';

import { ButtonPill, ButtonText } from '@wcpos/components/src/button';
import {
	Combobox,
	ComboboxTriggerPrimitive,
	ComboboxContent,
} from '@wcpos/components/src/combobox';
import { Query } from '@wcpos/query';

import { useT } from '../../../../../contexts/translations';
import { CategorySearch } from '../category-select';

type ProductCollection = import('@wcpos/database').ProductCollection;

interface Props {
	query: Query<ProductCollection>;
	resource: ObservableResource<import('@wcpos/database').ProductCategoryDocument>;
}

/**
 *
 */
export const CategoryPill = ({ query, resource }: Props) => {
	const category = useObservableSuspense(resource);
	const t = useT();
	const isActive = !!category;

	/**
	 *
	 */
	const handleSelect = React.useCallback(
		({ value }) => {
			query.where('categories', { $elemMatch: { id: parseInt(value, 10) } });
		},
		[query]
	);

	/**
	 *
	 */
	return (
		<Combobox onValueChange={handleSelect}>
			<ComboboxTriggerPrimitive asChild>
				<ButtonPill
					size="xs"
					leftIcon="folder"
					variant={isActive ? 'default' : 'muted'}
					removable={isActive}
					onRemove={() => query.where('categories', null)}
				>
					<ButtonText>{category ? category.name : t('Category', { _tags: 'core' })}</ButtonText>
				</ButtonPill>
			</ComboboxTriggerPrimitive>
			<ComboboxContent>
				<CategorySearch />
			</ComboboxContent>
		</Combobox>
	);
};
