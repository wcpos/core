import * as React from 'react';

import get from 'lodash/get';
import { useObservableEagerState } from 'observable-hooks';

import { useQueryManager } from '@wcpos/query';
import { IconButton } from '@wcpos/tailwind/src/icon-button';
import { Text } from '@wcpos/tailwind/src/text';
import { Tooltip, TooltipContent, TooltipTrigger } from '@wcpos/tailwind/src/tooltip';

import { useOrderStatusLabel } from '../../hooks/use-order-status-label';

type Props = {
	item: import('@wcpos/database').OrderDocument;
};

const iconMap = {
	pending: {
		name: 'clock',
		type: '#ffc107',
	},
	processing: {
		name: 'circleEllipsis',
		type: 'attention',
	},
	'on-hold': {
		name: 'circlePause',
		type: 'info',
	},
	completed: {
		name: 'circleCheck',
		type: 'success',
	},
	cancelled: {
		name: 'circleXmark',
		type: 'warning',
	},
	refunded: {
		name: 'arrowRotateLeft',
		type: 'attention',
	},
	failed: {
		name: 'triangleExclamation',
		type: 'critical',
	},
	'pos-open': {
		name: 'cartShopping',
		type: 'primary',
	},
	'pos-partial': {
		name: 'circleDollar',
		type: 'primary',
	},
};

/**
 *
 */
export const Status = ({ item: order }: Props) => {
	const status = useObservableEagerState(order.status$);
	const iconName = get(iconMap, [status, 'name'], 'circleQuestion');
	const iconType = get(iconMap, [status, 'type'], 'disabled');
	const manager = useQueryManager();
	const query = manager.getQuery(['orders']);
	const { getLabel } = useOrderStatusLabel();

	/**
	 *
	 */
	return (
		<Tooltip delayDuration={150}>
			<TooltipTrigger asChild>
				<IconButton
					name={iconName}
					variant={iconType}
					onPress={() => query.where('status', status)}
				/>
			</TooltipTrigger>
			<TooltipContent side="right">
				<Text>{getLabel(status)}</Text>
			</TooltipContent>
		</Tooltip>
	);
};
