import * as React from 'react';

import find from 'lodash/find';
import uniq from 'lodash/uniq';
import { useObservableSuspense, useObservableState } from 'observable-hooks';
import { map } from 'rxjs/operators';

import {
	calculateTaxes,
	sumTaxes,
	calculateDisplayValues,
	calculateLineItemTotals,
	calculateOrderTotalsAndTaxes,
} from './utils';
import { useAppState } from '../../../../contexts/app-state';

type TaxRateDocument = import('@wcpos/database').TaxRateDocument;
type TaxRateCollection = import('@wcpos/database').TaxRateCollection;
type TaxQuery = import('@wcpos/query').Query<TaxRateCollection>;

interface TaxHelpersContextProps {
	rates: TaxRateDocument[];
	shippingTaxClass: string;
	calcTaxes: boolean;
	pricesIncludeTax: boolean;
	taxRoundAtSubtotal: boolean;
	calculateTaxesFromPrice: (args: {
		price?: number;
		taxClass?: string;
		taxStatus?: string;
		pricesIncludeTax?: boolean;
	}) => {
		total: number;
		taxes: any[];
	};
	getDisplayValues: (
		price: string,
		taxClass: string,
		taxDisplayShop: 'incl' | 'excl'
	) => {
		displayPrice: string;
		taxTotal: string;
		taxDisplayShop: 'incl' | 'excl';
	};
	// taxBasedOn: 'base' | 'shipping' | 'billing';
	taxQuery: TaxQuery;
	// calculateLineItemTaxes: (args: {
	// 	total: string;
	// 	subtotal?: string;
	// 	taxClass?: string;
	// 	taxStatus?: string;
	// }) => {
	// 	total_tax: string;
	// 	taxes: {
	// 		id: number;
	// 		subtotal: string;
	// 		total: string;
	// 	}[];
	// 	subtotal_tax?: string;
	// };
	// calculateShippingLineTaxes: (args: { total: string }) => {
	// 	total: string;
	// 	total_tax: string;
	// 	taxes: {
	// 		id: number;
	// 		subtotal: string;
	// 		total: string;
	// 	}[];
	// };
	// calculateOrderTotals: (args: { lineItems: any[]; feeLines: any[]; shippingLines: any[] }) => {
	// 	discount_total: string;
	// 	discount_tax: string;
	// 	shipping_total: string;
	// 	shipping_tax: string;
	// 	cart_tax: string;
	// 	total_tax: string;
	// 	total: string;
	// 	tax_lines: {
	// 		id: number;
	// 		rate_code: string;
	// 		rate_id: number;
	// 		label: string;
	// 		compound: boolean;
	// 		tax_total: string;
	// 	}[];
	// };
}

export const TaxHelpersContext = React.createContext<TaxHelpersContextProps>(null);

interface TaxHelpersProviderProps {
	children: React.ReactNode;
	taxQuery: TaxQuery;
}

/**
 *
 */
export const TaxHelpersProvider = ({ children, taxQuery }: TaxHelpersProviderProps) => {
	const result = useObservableSuspense(taxQuery.resource);
	const rates = result.hits.map((hit) => hit.document);
	const { store } = useAppState();
	const shippingTaxClass = useObservableState(store.shipping_tax_class$, store.shipping_tax_class);
	// const taxBasedOn = useObservableState(store.tax_based_on$, store.tax_based_on);

	/**
	 * Convert WooCommerce settings into sensible primatives
	 */
	const calcTaxes = useObservableState(
		store.calc_taxes$.pipe(map((val) => val === 'yes')),
		store.calc_taxes === 'yes'
	);
	const pricesIncludeTax = useObservableState(
		store.prices_include_tax$.pipe(map((val) => val === 'yes')),
		store.prices_include_tax === 'yes'
	);
	const taxRoundAtSubtotal = useObservableState(
		store.tax_round_at_subtotal$.pipe(map((val) => val === 'yes')),
		store.tax_round_at_subtotal === 'yes'
	);

	/**
	 *
	 */
	const calculateTaxesFromPrice = React.useCallback(
		({
			price = 0,
			taxClass = '',
			taxStatus = 'taxable',
			/**
			 * A bit messy, sometimes I need to use the global setting,
			 * sometimes I need to use the override to false
			 */
			pricesIncludeTax: pIT = pricesIncludeTax, // default to global setting
		}) => {
			const _taxClass = taxClass === '' ? 'standard' : taxClass; // default to standard
			const appliedRates = rates.filter((rate) => rate.class === _taxClass);

			// early return if no taxes
			if (!calcTaxes || taxStatus === 'none' || appliedRates.length === 0) {
				return {
					total: 0,
					taxes: [],
				};
			}

			const taxes = calculateTaxes(price, appliedRates, pIT);
			return {
				total: sumTaxes(taxes),
				taxes,
			};
		},
		[pricesIncludeTax, calcTaxes, rates]
	);

	/**
	 * Get the display values for a price with or without taxes
	 */
	const getDisplayValues = React.useCallback(
		(price: string = '0', taxClass: string, taxDisplayShop: 'incl' | 'excl') => {
			const _taxClass = taxClass === '' ? 'standard' : taxClass; // default to standard
			const appliedRates = rates.filter((rate) => rate.class === _taxClass);

			// early return if no taxes
			if (!calcTaxes || appliedRates.length === 0) {
				return {
					displayPrice: String(price),
					taxTotal: '0',
					taxDisplayShop,
				};
			}

			return calculateDisplayValues({
				price,
				taxDisplayShop,
				pricesIncludeTax,
				rates: appliedRates,
				taxRoundAtSubtotal,
			});
		},
		[calcTaxes, pricesIncludeTax, rates, taxRoundAtSubtotal]
	);

	/**
	 *
	 */
	return (
		<TaxHelpersContext.Provider
			value={{
				rates,
				shippingTaxClass,
				calcTaxes,
				pricesIncludeTax,
				taxRoundAtSubtotal,
				calculateTaxesFromPrice,
				getDisplayValues,
				// taxBasedOn,
				taxQuery, // pass through for easy access
			}}
		>
			{children}
		</TaxHelpersContext.Provider>
	);
};
