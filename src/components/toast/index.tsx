import React from 'react';
import Portal from '../portal';
import Toast from './toast';

function notice(
	content: string,
	type: string,
	duration = 2,
	onClose: (() => void) | undefined,
	mask = true
) {
	const key = Portal.add(
		<Toast
			content={content}
			duration={duration}
			onClose={onClose}
			type={type}
			mask={mask}
			onAnimationEnd={() => Portal.remove(key)}
		/>
	);
	return key;
}

export default {
	SHORT: 3000,
	LONG: 8000,
	show(content: string, duration?: number, mask?: boolean) {
		return notice(content, 'info', duration, () => {}, mask);
	},
	info(content: string, duration?: number, onClose?: () => void, mask?: boolean) {
		return notice(content, 'info', duration, onClose, mask);
	},
	success(content: string, duration?: number, onClose?: () => void, mask?: boolean) {
		return notice(content, 'success', duration, onClose, mask);
	},
	fail(content: string, duration?: number, onClose?: () => void, mask?: boolean) {
		return notice(content, 'fail', duration, onClose, mask);
	},
	offline(content: string, duration?: number, onClose?: () => void, mask?: boolean) {
		return notice(content, 'offline', duration, onClose, mask);
	},
	loading(content: string, duration?: number, onClose?: () => void, mask?: boolean) {
		return notice(content, 'loading', duration, onClose, mask);
	},
};