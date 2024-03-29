import * as React from 'react';

import { useObservableEagerState } from 'observable-hooks';
import { of } from 'rxjs';

import { useTaxCalculation } from './use-tax-calculation';
import { useAppState } from '../../../../../contexts/app-state';
import { useTaxHelpers } from '../../../contexts/tax-helpers';
import { useCurrentOrder } from '../../contexts/current-order';

type OrderDocument = import('@wcpos/database').OrderDocument;
type FeeLine = NonNullable<OrderDocument['fee_lines']>[number];

/**
 * Account for string or number changes just in case
 */
interface Changes {
	name?: string;
	total?: string | number;
}

/**
 *
 */
export const useUpdateFeeLine = () => {
	const { currentOrder } = useCurrentOrder();
	const { store } = useAppState();
	const taxDisplayCart = useObservableEagerState(store?.tax_display_cart$ || of('excl'));
	const { calculateTaxesFromPrice } = useTaxHelpers();
	const { calculateLineItemTaxes } = useTaxCalculation();

	/**
	 * Get tax status from fee line meta data
	 *
	 * @TODO - default is 'taxable', is this correct?
	 */
	const getTaxStatus = (lineItem: FeeLine): string => {
		const taxStatusMetaData = lineItem.meta_data?.find(
			(meta) => meta.key === '_woocommerce_pos_tax_status'
		);
		return taxStatusMetaData?.value ?? 'taxable';
	};

	/**
	 * Update name of line item
	 */
	const updateName = (feeLine: FeeLine, name: string): FeeLine => {
		return {
			...feeLine,
			name,
		};
	};

	/**
	 * Update total of fee line
	 */
	const updateTotal = (lineItem: FeeLine, newTotal: number): FeeLine => {
		const taxStatus = getTaxStatus(lineItem);

		if (taxDisplayCart === 'incl') {
			const taxes = calculateTaxesFromPrice({
				price: newTotal,
				taxClass: lineItem?.tax_class ?? '',
				taxStatus,
				pricesIncludeTax: true,
			});
			newTotal -= taxes.total;
		}

		// recalculate taxes
		const taxes = calculateLineItemTaxes({
			total: String(newTotal),
			taxStatus,
			taxClass: lineItem.tax_class ?? '',
		});

		return {
			...lineItem,
			total: String(newTotal),
			...taxes,
		};
	};

	/**
	 * Update line item
	 *
	 * @TODO - what if more than one property is changed at once?
	 */
	const updateFeeLine = async (uuid: string, changes: Changes) => {
		const order = currentOrder.getLatest();
		let updated = false;

		const updatedFeeLines = order.fee_lines?.map((lineItem) => {
			const uuidMatch = lineItem.meta_data?.some(
				(m) => m.key === '_woocommerce_pos_uuid' && m.value === uuid
			);

			// early return if no match, or we have already updated a line item
			if (updated || !uuidMatch) {
				return lineItem;
			}

			let updatedItem = { ...lineItem };

			if (changes.name !== undefined) {
				updatedItem = updateName(updatedItem, changes.name);
			}

			if (changes.total !== undefined) {
				const total = typeof changes.total === 'number' ? changes.total : Number(changes.total);
				if (!isNaN(total)) updatedItem = updateTotal(updatedItem, total);
			}

			updated = true;
			return updatedItem;
		});

		// if we have updated a line item, patch the order
		if (updated && updatedFeeLines) {
			order.incrementalPatch({ fee_lines: updatedFeeLines });
		}
	};

	return { updateFeeLine };
};
