import * as React from 'react';
import { useObservableSuspense, ObservableResource } from 'observable-hooks';
import { WpCredentialsContext } from './wp-credentials-provider';

const useWpCredentials = () => {
	const context = React.useContext(WpCredentialsContext);
	if (context === undefined) {
		throw new Error(`useWpCredentials must be called within WpCredentialsProvider`);
	}

	const { wpCredentialsResource, wpUsersResource } = context;
	const wpCredentials = useObservableSuspense(wpCredentialsResource);
	const wpUsers = useObservableSuspense(wpUsersResource);

	return { wpCredentials, wpUsers, wpCredentialsResource };
};

export default useWpCredentials;