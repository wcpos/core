import * as React from 'react';

import get from 'lodash/get';
import { useObservableState } from 'observable-hooks';
import { map } from 'rxjs/operators';

import Pill from '@wcpos/components/src/pill';

import { useT } from '../../../../../contexts/translations';

const OnSalePill = ({ query }) => {
	const isActive = useObservableState(
		query.params$.pipe(map((params) => get(params, ['selector', 'on_sale']))),
		get(query.getParams(), ['selector', 'on_sale'])
	);
	const t = useT();

	return (
		<Pill
			icon="badgeDollar"
			size="small"
			color={isActive ? 'primary' : 'lightGrey'}
			onPress={() => query.where('on_sale', isActive ? null : true)}
			removable={isActive}
			onRemove={() => query.where('on_sale', null)}
		>
			{t('On Sale', { _tags: 'core' })}
		</Pill>
	);
};

export default OnSalePill;
