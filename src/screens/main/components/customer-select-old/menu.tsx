import * as React from 'react';
import { View, FlatList } from 'react-native';

import { useObservableSuspense, useObservableState } from 'observable-hooks';
import { useTheme } from 'styled-components/native';

import { Avatar } from '@wcpos/components/src/avatar/avatar';
import Box from '@wcpos/components/src/box';
import { usePopover } from '@wcpos/components/src/popover/context';
import Pressable from '@wcpos/components/src/pressable';
import Text from '@wcpos/components/src/text';
import { useInfiniteScroll, useReplicationState } from '@wcpos/query';
import Table from '@wcpos/tailwind/src/table';

import CustomerSelectItem from './item';
import { useT } from '../../../../contexts/translations';

type CustomerDocument = import('@wcpos/database').CustomerDocument;

/**
 * TODO - this is taken from the menu component, should be moved to a shared location
 */
const convertHexToRGBA = (hexCode, opacity = 1) => {
	let hex = hexCode.replace('#', '');

	if (hex.length === 3) {
		hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
	}

	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	/* Backward compatibility for whole number based opacity values. */
	if (opacity > 1 && opacity <= 100) {
		opacity = opacity / 100;
	}

	return `rgba(${r},${g},${b},${opacity})`;
};

interface CustomerSelectMenuProps {
	query: any;
	onChange: (item: CustomerDocument) => void;
	withGuest?: boolean;
}

/**
 *
 */
const CustomerSelectMenu = ({ query, onChange, withGuest = true }: CustomerSelectMenuProps) => {
	const theme = useTheme();
	const result = useInfiniteScroll(query);
	const { active$ } = useReplicationState(query.id);
	const loading = useObservableState(active$, false);
	// const total = useTotalCount('customers', replicationState);
	const { targetMeasurements, contentMeasurements } = usePopover();
	const t = useT();

	/**
	 *
	 */
	const calculatedStyled = React.useCallback(
		({ hovered }) => {
			const hoverBackgroundColor = convertHexToRGBA(theme.colors['primary'], 0.1);
			return [
				{
					padding: theme.spacing.small,
					flex: 1,
					flexDirection: 'row',
					backgroundColor: hovered ? hoverBackgroundColor : 'transparent',
				},
			];
		},
		[theme]
	);

	/**
	 *
	 */
	const renderItem = React.useCallback(
		({ item }) => {
			return (
				<Pressable onPress={() => onChange(item.document)} style={calculatedStyled}>
					<CustomerSelectItem customer={item.document} />
				</Pressable>
			);
		},
		[calculatedStyled, onChange]
	);

	/**
	 *
	 */
	const renderGuestItem = React.useMemo(() => {
		return (
			<Pressable onPress={() => onChange({ id: 0 })} style={calculatedStyled}>
				<Box horizontal space="small" fill>
					<Box>
						<Avatar
							size="small"
							source="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
							recyclingKey="guest"
						/>
					</Box>
					<Box space="xSmall" fill>
						<Text>{t('Guest', { _tags: 'core' })}</Text>
					</Box>
				</Box>
			</Pressable>
		);
	}, [calculatedStyled, onChange, t]);

	/**
	 *
	 */
	// const onEndReached = React.useCallback(() => {
	// 	if (hasMore) {
	// 		loadNextPage();
	// 	} else if (!loading && total > count) {
	// 		replicationState.start({ fetchRemoteIDs: false });
	// 	}
	// }, [count, hasMore, loadNextPage, loading, replicationState, total]);

	/**
	 *
	 */
	return (
		<View style={{ width: targetMeasurements.value.width, maxHeight: 292 }}>
			<FlatList<CustomerDocument>
				data={result.hits}
				renderItem={renderItem}
				estimatedItemSize={50}
				ListHeaderComponent={withGuest ? renderGuestItem : undefined}
				onEndReached={() => result.nextPage()}
				ListFooterComponent={<Table.LoadingRow loading={loading} style={{ padding: 0 }} />}
			/>
		</View>
	);
};

export default CustomerSelectMenu;
