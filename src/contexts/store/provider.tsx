import * as React from 'react';

import { ObservableResource } from 'observable-hooks';
import { from } from 'rxjs';

import { storeDBPromise } from '@wcpos/database/src/stores-db';

import useAuth from '../auth';

export const StoreContext = React.createContext<{
	storeDBResource: ObservableResource<import('@wcpos/database').StoreDatabase | null>;
}>(null);

interface StoreProviderProps {
	children: React.ReactNode;
}

/**
 *
 */
export const StoreProvider = ({ children }: StoreProviderProps) => {
	const { store } = useAuth();

	/**
	 *
	 */
	const value = React.useMemo(() => {
		const promise = store?.localID ? storeDBPromise(store.localID) : Promise.resolve(null);
		const storeDBResource = new ObservableResource(from(promise));
		return { storeDBResource };
	}, [store]);

	/**
	 *
	 */
	return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export default StoreProvider;