import * as React from 'react';

import toNumber from 'lodash/toNumber';
import { useObservableState, ObservableResource, useObservable } from 'observable-hooks';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { HStack } from '@wcpos/components/src/hstack';
import { Suspense } from '@wcpos/components/src/suspense';
import { useQuery } from '@wcpos/query';

import { useAppState } from '../../../contexts/app-state';
import { CashierPill } from '../components/order/filter-bar/cashier-pill';
import CustomerPill from '../components/order/filter-bar/customer-pill';
import { StatusPill } from '../components/order/filter-bar/status-pill';
import { StorePill } from '../components/order/filter-bar/store-pill';
import { useGuestCustomer } from '../hooks/use-guest-customer';

/**
 *
 */
const FilterBar = ({ query }) => {
	const guestCustomer = useGuestCustomer();
	const customerID = useObservableState(
		query.params$.pipe(map(() => query.findSelector('customer_id'))),
		query.findSelector('customer_id')
	);
	const cashierID = useObservableState(
		query.params$.pipe(map(() => query.findMetaDataSelector('_pos_user'))),
		query.findMetaDataSelector('_pos_user')
	);
	const { wpCredentials } = useAppState();

	/**
	 *
	 */
	const customerQuery = useQuery({
		queryKeys: ['customers', 'customer-filter'],
		collectionName: 'customers',
	});

	/**
	 *
	 */
	React.useEffect(() => {
		if (customerID) {
			customerQuery.where('id', customerID);
		}
	}, [customerID, customerQuery]);

	/**
	 *
	 */
	const cashierQuery = useQuery({
		queryKeys: ['customers', 'cashier-filter'],
		collectionName: 'customers',
	});

	/**
	 *
	 */
	React.useEffect(() => {
		if (cashierID) {
			cashierQuery.where('id', parseInt(cashierID, 10));
		}
	}, [cashierID, cashierQuery]);

	/**
	 *
	 */
	const selectedCustomer$ = useObservable(
		(inputs$) =>
			inputs$.pipe(
				switchMap(([id]) => {
					if (id === 0) {
						return of(guestCustomer);
					}
					if (!id) {
						return of(null);
					}
					return customerQuery.result$.pipe(
						map((result) => {
							if (result.count === 1) return result.hits[0].document;
						})
					);
				})
			),
		[customerID]
	);

	/**
	 *
	 */
	const customerResource = React.useMemo(
		() => new ObservableResource(selectedCustomer$),
		[selectedCustomer$]
	);

	/**
	 *
	 */
	const selectedCashier$ = useObservable(
		(inputs$) =>
			inputs$.pipe(
				switchMap(([id]) => {
					if (toNumber(id) === 0) {
						return of(guestCustomer);
					}
					if (!id) {
						return of(null);
					}
					return cashierQuery.result$.pipe(
						map((result) => {
							if (result.count === 1) return result.hits[0].document;
						})
					);
				})
			),
		[cashierID]
	);

	/**
	 *
	 */
	const cashierResource = React.useMemo(
		() => new ObservableResource(selectedCashier$),
		[selectedCashier$]
	);

	/**
	 *
	 */
	const storesResource = React.useMemo(
		() => new ObservableResource(wpCredentials.populate$('stores'), (val) => !!val),
		[wpCredentials]
	);

	/**
	 *
	 */
	return (
		<HStack>
			<StatusPill query={query} />
			<Suspense>
				<CustomerPill resource={customerResource} query={query} />
			</Suspense>
			<Suspense>
				<CashierPill resource={cashierResource} query={query} />
			</Suspense>
			<StorePill resource={storesResource} query={query} />
		</HStack>
	);
};

export default FilterBar;
