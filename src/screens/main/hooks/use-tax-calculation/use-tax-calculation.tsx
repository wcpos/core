import * as React from 'react';

import sumBy from 'lodash/sumBy';
import { useObservableState } from 'observable-hooks';

import { calcTaxes, sumItemizedTaxes, sumTaxes } from './utils';
import useLocalData from '../../../../contexts/local-data';
import useTaxRates from '../../contexts/tax-rates';

type LineItemDocument = import('@wcpos/database').LineItemDocument;
type FeeLineDocument = import('@wcpos/database').FeeLineDocument;
type ShippingLineDocument = import('@wcpos/database').ShippingLineDocument;
type CartItem = LineItemDocument | FeeLineDocument | ShippingLineDocument;
type Cart = CartItem[];
// type TaxRateSchema = import('@wcpos/database').TaxRateSchema;
// interface Taxes {
// 	id: number;
// 	total: string;
// }

const useTaxCalculation = () => {
	const { data: rates } = useTaxRates();
	const { store } = useLocalData();
	const _calcTaxes = useObservableState(store?.calc_taxes$, store?.calc_taxes);
	const pricesIncludeTax = useObservableState(
		store?.prices_include_tax$,
		store?.prices_include_tax
	);
	const taxRoundAtSubtotal = useObservableState(
		store?.tax_round_at_subtotal$,
		store?.tax_round_at_subtotal
	);

	/**
	 *
	 */
	const getDisplayValues = React.useCallback(
		(price: string | undefined, taxClass: string, taxDisplayShop: 'incl' | 'excl') => {
			const _taxClass = taxClass === '' ? 'standard' : taxClass; // default to standard
			const appliedRates =
				_calcTaxes === 'yes' ? rates.filter((rate) => rate.class === _taxClass) : [];
			const taxes = calcTaxes(price, appliedRates, pricesIncludeTax === 'yes');
			const itemizedTaxTotals = sumItemizedTaxes(taxes, taxRoundAtSubtotal);
			const taxTotal = sumTaxes(itemizedTaxTotals);
			let displayPrice = price;

			// pricesIncludeTax taxDisplayShop
			if (pricesIncludeTax === 'yes' && taxDisplayShop === 'excl') {
				displayPrice = +price - taxTotal;
			}

			if (pricesIncludeTax === 'no' && taxDisplayShop === 'incl') {
				displayPrice = +price + taxTotal;
			}

			return {
				displayPrice,
				taxTotal,
				taxDisplayShop,
			};
		},
		[_calcTaxes, pricesIncludeTax, rates, taxRoundAtSubtotal]
	);

	/**
	 * Calculate line item totals
	 */
	const calcLineItemTotals = React.useCallback(
		(qty = 1, price = 0, taxClass) => {
			const _taxClass = taxClass === '' ? 'standard' : taxClass; // default to standard
			const appliedRates =
				_calcTaxes === 'yes' ? rates.filter((rate) => rate.class === _taxClass) : [];
			const discounts = 0;
			const subtotal = qty * price;
			const subtotalTaxes = calcTaxes(subtotal, rates);
			const itemizedSubTotalTaxes = sumItemizedTaxes(subtotalTaxes, taxRoundAtSubtotal);
			const total = subtotal - discounts;
			const totalTaxes = calcTaxes(subtotal, appliedRates, pricesIncludeTax === 'yes');
			const itemizedTotalTaxes = sumItemizedTaxes(totalTaxes, taxRoundAtSubtotal);
			// itemizedSubTotalTaxes & itemizedTotalTaxes should be same size
			// is there a case where they are not?
			const taxes = itemizedSubTotalTaxes.map((obj) => {
				const index = itemizedTotalTaxes.findIndex((el) => el.id === obj.id);
				const totalTax = index !== -1 ? itemizedTotalTaxes[index] : { total: 0 };
				return {
					id: obj.id,
					subtotal: String(obj.total ?? 0),
					total: String(totalTax.total ?? 0),
				};
			});

			return {
				subtotal: String(subtotal),
				subtotal_tax: String(sumTaxes(subtotalTaxes, taxRoundAtSubtotal)),
				total: String(total),
				total_tax: String(sumTaxes(totalTaxes, taxRoundAtSubtotal)),
				taxes,
			};
		},
		[_calcTaxes, pricesIncludeTax, rates, taxRoundAtSubtotal]
	);

	/**
	 * Calc order totals
	 */
	const calcOrderTotals = React.useCallback(
		(lines: Cart) => {
			const total = sumBy(lines, (item) => +(item.total ?? 0));
			const totalTax = sumBy(lines, (item) => +(item.total_tax ?? 0));
			const totalWithTax = total + totalTax;
			const totalTaxString = String(totalTax);
			const totalWithTaxString = String(totalWithTax);
			const itemizedTaxes = sumItemizedTaxes(
				lines.map((line) => line.taxes ?? []),
				taxRoundAtSubtotal
			);

			/**
			 * line_item.taxes don't have label, we need to add back it here
			 */
			const taxLines = itemizedTaxes.map((tax) => {
				const taxRate = rates.find((rate) => rate.id === String(tax.id));
				return {
					rate_id: tax.id,
					// rate_code: ??,
					label: taxRate?.name,
					compound: taxRate?.compound,
					tax_total: String(tax.total),
				};
			});

			return {
				total: totalWithTaxString,
				total_tax: totalTaxString,
				tax_lines: taxLines,
			};
		},
		[taxRoundAtSubtotal, rates]
	);

	return {
		getDisplayValues,
		calcLineItemTotals,
		calcOrderTotals,
	};
};

export default useTaxCalculation;