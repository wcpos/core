import * as React from 'react';

import get from 'lodash/get';
import { useObservableState } from 'observable-hooks';
import { map } from 'rxjs/operators';

import Dropdown from '@wcpos/components/src/dropdown';
import Pill from '@wcpos/components/src/pill';
import { Query } from '@wcpos/query';

import { useT } from '../../../../../contexts/translations';
import { useStockStatusLabel } from '../../../hooks/use-stock-status-label';

type ProductCollection = import('@wcpos/database').ProductCollection;

interface Props {
	query: Query<ProductCollection>;
}

/**
 *
 */
export const StockStatusPill = ({ query }: Props) => {
	const selected = useObservableState(
		query.params$.pipe(map((params) => get(params, ['selector', 'stock_status']))),
		get(query.getParams(), ['selector', 'stock_status'])
	) as string | undefined;
	const t = useT();
	const isActive = !!selected;
	const { items, getLabel } = useStockStatusLabel();
	const [open, setOpen] = React.useState(false);

	/**
	 *
	 */
	const label = React.useMemo(() => {
		if (!selected) {
			return t('Stock Status', { _tags: 'core' });
		}

		const label = getLabel(selected);
		if (label) {
			return label;
		}

		return String(selected);
	}, [getLabel, selected, t]);

	return (
		<Dropdown
			items={items}
			opened={open}
			onClose={() => setOpen(false)}
			onSelect={(val) => query.where('stock_status', val)}
			withArrow={false}
			matchWidth
		>
			<Pill
				icon="warehouseFull"
				size="small"
				color={isActive ? 'primary' : 'lightGrey'}
				onPress={() => setOpen(true)}
				removable={isActive}
				onRemove={() => query.where('stock_status', null)}
			>
				{label}
			</Pill>
		</Dropdown>
	);
};