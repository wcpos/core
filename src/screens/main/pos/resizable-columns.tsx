import * as React from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { useSubscription } from 'observable-hooks';
import Animated, {
	useAnimatedGestureHandler,
	useSharedValue,
	useAnimatedStyle,
	runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Gutter from '@wcpos/components/src/gutter';
import Box from '@wcpos/components/src/box';
import useWhyDidYouUpdate from '@wcpos/hooks/src/use-why-did-you-update';
import Products from './products';
import OpenOrders from './cart';

interface ResizableColumnsProps {
	ui: import('@wcpos/hooks/src/use-store').UIDocument;
}

/**
 *
 */
const clamp = (value: number, lowerBound: number, upperBound: number) => {
	'worklet';

	return Math.min(Math.max(lowerBound, value), upperBound);
};

/**
 *
 */
const ResizableColumns = ({ ui }: ResizableColumnsProps) => {
	const columnWidth = useSharedValue(ui.get('width'));
	const isActivePanGesture = useSharedValue(false);
	const containerWidth = useSharedValue(800);

	/**
	 *
	 */
	useSubscription(ui.get$('width'), (width: number) => {
		columnWidth.value = width;
	});

	/**
	 *
	 */
	const onContainerLayout = React.useCallback(
		(e: LayoutChangeEvent) => {
			containerWidth.value = e.nativeEvent.layout.width;
		},
		[containerWidth]
	);

	/**
	 *
	 */
	const columnStyle = useAnimatedStyle(() => ({
		width: `${columnWidth.value}%`,
	}));

	/**
	 *
	 */
	const saveColumnWidth = React.useCallback(
		(width: number) => {
			ui.atomicPatch({ width });
		},
		[ui]
	);

	/**
	 *
	 */
	const panGestureHandler = useAnimatedGestureHandler<
		PanGestureHandlerGestureEvent,
		{ startWidth: number }
	>({
		onStart: (_, ctx) => {
			isActivePanGesture.value = true;
			ctx.startWidth = columnWidth.value;
		},
		onActive: (event, ctx) => {
			columnWidth.value = clamp(
				ctx.startWidth + (event.translationX / containerWidth.value) * 100,
				20,
				80
			);
		},
		onEnd: () => {
			isActivePanGesture.value = false;
			runOnJS(saveColumnWidth)(columnWidth.value);
		},
	});

	useWhyDidYouUpdate('ResizableColumns', {
		ui,
		columnWidth,
		isActivePanGesture,
		containerWidth,
		onContainerLayout,
		columnStyle,
		panGestureHandler,
		saveColumnWidth,
	});

	/**
	 *
	 */
	return (
		<Box horizontal onLayout={onContainerLayout} style={{ height: '100%' }}>
			<Animated.View style={[columnStyle]}>
				<Products isColumn />
			</Animated.View>
			<PanGestureHandler onGestureEvent={panGestureHandler}>
				<Animated.View style={{ width: 10 }}>
					<Gutter />
				</Animated.View>
			</PanGestureHandler>
			<View style={{ flex: 1 }}>
				<OpenOrders isColumn />
			</View>
		</Box>
	);
};

export default ResizableColumns;