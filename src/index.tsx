import * as React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SafeAreaProviderCompat } from '@react-navigation/elements';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from 'styled-components/native';
import get from 'lodash/get';
import { enableFreeze } from 'react-native-screens';
import getTheme from '@wcpos/themes';
import ErrorBoundary from '@wcpos/components/src/error-boundary';
import { AppStateProvider } from '@wcpos/hooks/src/use-app-state';
import Portal from '@wcpos/components/src/portal';
import { SnackbarProvider } from '@wcpos/components/src/snackbar';
import * as Linking from 'expo-linking';
import TranslationService from './services/translation';
import AppNavigator from './navigators';
// import SplashScreen from './screens/splash';
import Url from './lib/url-parse';
// import { AuthLoginProvider } from './hooks/use-auth-login';

// enable freeze
enableFreeze(true);

const i18n = new TranslationService();

type InitialProps = import('./types').InitialProps;

const prefix = Linking.createURL('/');

const App = (initialProps: InitialProps) => {
	const homepage = get(initialProps, 'homepage');
	const prefixes = ['wcpos://', prefix];
	console.log(prefixes);

	let pathname = '';

	if (homepage) {
		const parsedUrl = new Url(homepage);
		prefixes.push(parsedUrl.host);
		pathname = parsedUrl.pathname;
	}

	const linking = {
		prefixes,
		config: {
			screens: {
				Auth: `${pathname}/auth`,
				Main: {
					path: pathname,
					screens: {
						POS: {
							path: '',
						},
						Products: {
							path: 'products',
						},
						Orders: {
							path: 'orders',
						},
						Customers: {
							path: 'customers',
						},
						Support: {
							path: 'support',
						},
					},
				},
				Modal: `${pathname}/#`,
				Login: `${pathname}/login`,
			},
		},
	};

	return (
		<ErrorBoundary>
			<React.Suspense fallback={<Text>loading app...</Text>}>
				<GestureHandlerRootView style={{ flex: 1 }}>
					<AppStateProvider initialProps={initialProps}>
						<ThemeProvider theme={getTheme('default', 'dark')}>
							<SafeAreaProviderCompat style={{ overflow: 'hidden' }}>
								<SnackbarProvider>
									<Portal.Provider>
										<NavigationContainer linking={linking}>
											<AppNavigator />
										</NavigationContainer>
										<Portal.Manager />
									</Portal.Provider>
								</SnackbarProvider>
							</SafeAreaProviderCompat>
						</ThemeProvider>
					</AppStateProvider>
				</GestureHandlerRootView>
			</React.Suspense>
		</ErrorBoundary>
	);
};

export default App;