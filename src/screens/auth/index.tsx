import * as React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import Connect from './connect';
import Login from './login';

export type ConnectStackParamList = {
	Connect: undefined;
	Login: { siteID: string };
};

const Stack = createStackNavigator<ConnectStackParamList>();

/**
 *
 */
const AuthNavigator = () => {
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="Connect" component={Connect} />
			<Stack.Screen name="Login" component={Login} options={{ presentation: 'transparentModal' }} />
		</Stack.Navigator>
	);
};

export default AuthNavigator;