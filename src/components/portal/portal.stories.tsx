import React, { useState } from 'react';
import { View } from 'react-native';
import Button from '../button';
import Text from '../text';

import { storiesOf } from '@storybook/react';
// import { select } from '@storybook/addon-knobs';

import Portal from './';

let key: number;

const contents = (
	<View>
		<Button onPress={() => Portal.remove(key)} title="Close Portal" />
	</View>
);

const MyComponent = () => {
	const [open, setOpen] = useState(false);

	return (
		<View>
			<Text>This is the component</Text>
			<Button
				title="Toggle Portal"
				onPress={() => {
					setOpen(!open);
				}}
			/>
			{open && (
				<Portal>
					<Text>This is rendered at a different place</Text>
				</Portal>
			)}
		</View>
	);
};

storiesOf('Portal', module)
	/**
	 *
	 */
	.add('basic usage', () => (
		<Portal.Host>
			<Button
				onPress={() => {
					key = Portal.add(contents);
					console.log(key);
				}}
				title="Open Portal"
			/>
		</Portal.Host>
	))

	/**
	 * Portal Host
	 */
	.add('host', () => (
		<Portal.Host>
			<Text>This is the application</Text>
			<MyComponent />
		</Portal.Host>
	));