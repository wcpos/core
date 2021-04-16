import * as React from 'react';
import { Animated } from 'react-native';

interface BaseAnimationConfig {
	initialValue?: number;
	toValue: number;
}

export type TimingAnimationConfig = BaseAnimationConfig &
	({ type: 'timing' } & Omit<Animated.TimingAnimationConfig, 'toValue'>);

export type SpringAnimationConfig = BaseAnimationConfig &
	({ type: 'spring' } & Omit<Animated.SpringAnimationConfig, 'toValue'>);

export type UseAnimationConfig = TimingAnimationConfig | SpringAnimationConfig;

const getInitialValue = (config: UseAnimationConfig): number => {
	if (typeof config.initialValue !== 'undefined') {
		return config.initialValue;
	}
	return config.toValue;
};

/**
 * Returns an `Animated.Value` object initialized with the specified config.
 * Its initial value is either `initialValue` or if this is not provided, initial
 * `toValue` is used.
 *
 * When `toValue` value changes, an animation will run with the specified config.
 */
export const useAnimation = (config: UseAnimationConfig): Animated.Value => {
	const animatedValue = React.useRef(new Animated.Value(getInitialValue(config))).current;

	React.useEffect(() => {
		switch (config.type) {
			case 'timing':
				Animated.timing(animatedValue, config).start();
				break;
			case 'spring':
				Animated.spring(animatedValue, config).start();
				break;
			default:
				console.warn('Unsupported animation type. Should be timing or spring.');
		}
	}, [config.toValue]);

	return animatedValue;
};

export default useAnimation;
