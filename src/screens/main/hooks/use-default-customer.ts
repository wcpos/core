import * as React from 'react';

import { ObservableResource } from 'observable-hooks';
import { of, lastValueFrom, startWith } from 'rxjs';

import { useDefaultCustomerID } from './use-default-customer-id';
import { useGetDocumentByRemoteId } from '../hooks/use-get-document-by-remote-id';
import { useGuestCustomer } from '../hooks/use-guest-customer';

export const useDefaultCustomer = () => {
	const guestCustomer = useGuestCustomer();
	const defaultCustomerID = useDefaultCustomerID();
	const { document$ } = useGetDocumentByRemoteId({
		collectionName: 'customers',
		remoteID: defaultCustomerID,
		fallback: guestCustomer,
	});
	const _hack$ = document$.pipe(startWith(guestCustomer));
	const defaultCustomer$ = defaultCustomerID === 0 ? of(guestCustomer) : _hack$;
	const defaultCustomerPromise = lastValueFrom(defaultCustomer$);

	const defaultCustomerResource = React.useMemo(
		() => new ObservableResource(defaultCustomer$),
		[defaultCustomer$]
	);

	return { defaultCustomer$, defaultCustomerResource, defaultCustomerPromise };
};
