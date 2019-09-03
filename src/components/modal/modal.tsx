import PropTypes from 'prop-types';
import React from 'react';
import {
	Dimensions,
	LayoutChangeEvent,
	StyleProp,
	StyleSheet,
	Text,
	TextStyle,
	TouchableHighlight,
	TouchableWithoutFeedback,
	View,
	ViewStyle,
} from 'react-native';
// import alert from './alert';
import ModalView from './view';
// import operation from './operation';
// import prompt from './prompt';
import { ModalContainer } from './styles';

interface Action<T = TextStyle> {
	text: string;
	onPress?: () => void | Promise<any>;
	style?: T | string;
}

interface ModalPropsType<T> {
	title?: React.ReactNode;
	visible: boolean;
	maskClosable?: boolean;
	closable?: boolean;
	footer?: Action<T>[];
	onClose?: () => void;
	transparent?: boolean;
	popup?: boolean;
	animated?: boolean;
	locale?: object;
	animationType?: any;
	onAnimationEnd?: (visible: boolean) => void;
	animateAppear?: boolean;
	operation?: boolean;
}

const maxHeight = StyleSheet.create({
	maxHeight: {
		maxHeight: Dimensions.get('window').height,
	},
}).maxHeight;

export interface ModalProps extends ModalPropsType<TextStyle> {
	style?: StyleProp<ViewStyle>;
	bodyStyle?: StyleProp<ViewStyle>;
}

class Modal extends React.Component<ModalProps, any> {
	static defaultProps = {
		visible: false,
		closable: false,
		maskClosable: false,
		style: {},
		bodyStyle: {},
		animationType: 'fade',
		onClose() {},
		footer: [],
		transparent: false,
		popup: false,
		animateAppear: true,
		operation: false,
	};
	// static alert: typeof alert;
	// static operation: typeof operation;
	// static prompt: typeof prompt;

	root: View | null;

	onFooterLayout = (e: LayoutChangeEvent) => {
		if (this.root) {
			this.root.setNativeProps({
				style: [{ paddingBottom: e.nativeEvent.layout.height }, maxHeight],
			});
		}
	};

	saveRoot = (root: any) => {
		this.root = root;
	};

	render() {
		const {
			title,
			closable,
			footer,
			children,
			style,
			animateAppear,
			maskClosable,
			popup,
			transparent,
			visible,
			onClose,
			bodyStyle,
			onAnimationEnd,
		} = this.props;

		return (
			// <WithTheme styles={this.props.styles} themeStyles={modalStyles}>
			// 	{styles => {
			// 		let btnGroupStyle = styles.buttonGroupV;
			// 		let horizontalFlex = {};
			// 		if (footer && footer.length === 2 && !this.props.operation) {
			// 			btnGroupStyle = styles.buttonGroupH;
			// 			horizontalFlex = { flex: 1 };
			// 		}
			// 		const buttonWrapStyle =
			// 			footer && footer.length === 2 ? styles.buttonWrapH : styles.buttonWrapV;
			// 		let footerDom;
			// 		if (footer && footer.length) {
			// 			const footerButtons = footer.map((button, i) => {
			// 				let buttonStyle = {};
			// 				if (this.props.operation) {
			// 					buttonStyle = styles.buttonTextOperation;
			// 				}
			// 				if (button.style) {
			// 					buttonStyle = button.style;
			// 					if (typeof buttonStyle === 'string') {
			// 						const styleMap: {
			// 							[key: string]: object;
			// 						} = {
			// 							cancel: {},
			// 							default: {},
			// 							destructive: { color: 'red' },
			// 						};
			// 						buttonStyle = styleMap[buttonStyle] || {};
			// 					}
			// 				}
			// 				const noneBorder =
			// 					footer && footer.length === 2 && i === 1 ? { borderRightWidth: 0 } : {};
			// 				const onPressFn = () => {
			// 					if (button.onPress) {
			// 						button.onPress();
			// 					}
			// 					if (onClose) {
			// 						onClose();
			// 					}
			// 				};
			// 				return (
			// 					<TouchableHighlight
			// 						key={i}
			// 						style={horizontalFlex}
			// 						underlayColor="#ddd"
			// 						onPress={onPressFn}
			// 					>
			// 						<View style={[buttonWrapStyle, noneBorder]}>
			// 							<Text style={[styles.buttonText, buttonStyle]}>{button.text}</Text>
			// 						</View>
			// 					</TouchableHighlight>
			// 				);
			// 			});
			// 			footerDom = (
			// 				<View style={[btnGroupStyle, styles.footer]} onLayout={this.onFooterLayout}>
			// 					{footerButtons}
			// 				</View>
			// 			);
			// 		}

			// 		let animType = this.props.animationType;
			// 		if (transparent) {
			// 			if (animType === 'slide') {
			// 				animType = 'slide-up';
			// 			}
			// 			const closableDom = closable ? (
			// 				<View style={[styles.closeWrap]}>
			// 					<TouchableWithoutFeedback onPress={onClose}>
			// 						<View>
			// 							<Text style={[styles.close]}>×</Text>
			// 						</View>
			// 					</TouchableWithoutFeedback>
			// 				</View>
			// 			) : null;
			// 			return (
			// 				<View style={styles.container}>
			// 					<ModalView
			// 						onClose={onClose}
			// 						animationType={animType}
			// 						wrapStyle={transparent ? styles.wrap : undefined}
			// 						style={[styles.innerContainer, style]}
			// 						visible={visible}
			// 						onAnimationEnd={onAnimationEnd}
			// 						animateAppear={animateAppear}
			// 						maskClosable={maskClosable}
			// 					>
			// 						<View style={maxHeight} ref={this.saveRoot}>
			// 							{title ? <Text style={[styles.header]}>{title}</Text> : null}
			// 							<View style={[styles.body, bodyStyle]}>{children}</View>
			// 							{footerDom}
			// 							{closableDom}
			// 						</View>
			// 					</ModalView>
			// 				</View>
			// 			);
			// 		}
			// 		if (popup) {
			// 			let aType = 'SlideDown';
			// 			if (animType === 'slide-up') {
			// 				animType = 'slide-up';
			// 				aType = 'SlideUp';
			// 			} else {
			// 				animType = 'slide-down';
			// 			}
			// 			return (
			// 				<View style={styles.container}>
			// 					<ModalView
			// 						onClose={onClose}
			// 						animationType={animType}
			// 						// tslint:disable-next-line:jsx-no-multiline-js
			// 						style={[styles.popupContainer, (styles as any)[`popup${aType}`], style]}
			// 						visible={visible}
			// 						onAnimationEnd={onAnimationEnd}
			// 						animateAppear={animateAppear}
			// 						maskClosable={maskClosable}
			// 					>
			// 						<View ref={this.saveRoot} style={bodyStyle}>
			// 							{children}
			// 						</View>
			// 					</ModalView>
			// 				</View>
			// 			);
			// 		}
			// 		if (animType === 'slide') {
			// 			animType = undefined;
			// 		}
			// 		return (
			<ModalContainer>
				<ModalView visible={visible} onClose={onClose}>
					<View style={style}>{children}</View>
				</ModalView>
			</ModalContainer>
			// 		);
			// 	}}
			// </WithTheme>
		);
	}
}

export default Modal;
