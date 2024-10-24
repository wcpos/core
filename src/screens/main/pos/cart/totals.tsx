import * as React from 'react';

import { ErrorBoundary } from '@wcpos/components/src/error-boundary';
import { HStack } from '@wcpos/components/src/hstack';
import { Text } from '@wcpos/components/src/text';
import { VStack } from '@wcpos/components/src/vstack';

import { CustomerNote } from './totals/customer-note';
import { Taxes } from './totals/taxes';
import { useT } from '../../../../contexts/translations';
import { useCurrentOrderCurrencyFormat } from '../../hooks/use-current-order-currency-format';
import { useTaxInclOrExcl } from '../../hooks/use-tax-incl-or-excl';
import { useOrderTotals } from '../hooks/use-order-totals';

/**
 *
 */
export const Totals = () => {
	const t = useT();
	const { format } = useCurrentOrderCurrencyFormat();
	const { inclOrExcl } = useTaxInclOrExcl({ context: 'cart' });

	const {
		subtotal,
		subtotal_tax,
		fee_total,
		fee_tax,
		tax_lines,
		total_tax,
		discount_tax,
		discount_total,
		shipping_tax,
		shipping_total,
	} = useOrderTotals();

	/**
	 * Helpers
	 */
	const hasSubtotal = parseFloat(subtotal) !== 0;
	const hasDiscount = parseFloat(discount_total) !== 0;
	const hasShipping = parseFloat(shipping_total) !== 0;
	const hasFee = parseFloat(fee_total) !== 0;
	const hasTax = parseFloat(total_tax) !== 0;
	const hasTotals = hasSubtotal || hasDiscount || hasShipping || hasFee || hasTax;

	/**
	 *
	 */
	const displaySubtotal =
		inclOrExcl === 'incl' ? parseFloat(subtotal) + parseFloat(subtotal_tax) : subtotal;
	const displayDiscountTotal =
		inclOrExcl === 'incl' ? parseFloat(discount_total) + parseFloat(discount_tax) : discount_total;
	const displayFeeTotal =
		inclOrExcl === 'incl' ? parseFloat(fee_total) + parseFloat(fee_tax) : fee_total;
	const displayShippingTotal =
		inclOrExcl === 'incl' ? parseFloat(shipping_total) + parseFloat(shipping_tax) : shipping_total;

	return (
		<>
			{hasTotals ? (
				<VStack className="p-2 border-border border-t bg-muted/40">
					<HStack>
						<Text className="grow">{t('Subtotal', { _tags: 'core' })}:</Text>
						<Text>{format(displaySubtotal)}</Text>
					</HStack>
					{
						// Discounts
						hasDiscount && (
							<HStack>
								<Text className="grow">{t('Discount', { _tags: 'core' })}:</Text>
								<Text>{format(`-${displayDiscountTotal}`)}</Text>
							</HStack>
						)
					}
					{
						// Fees
						hasFee && (
							<HStack>
								<Text className="grow">{t('Fees', { _tags: 'core' })}:</Text>
								<Text>{format(displayFeeTotal)}</Text>
							</HStack>
						)
					}
					{
						// Shipping
						hasShipping && (
							<HStack>
								<Text className="grow">{t('Shipping', { _tags: 'core' })}:</Text>
								<Text>{format(displayShippingTotal)}</Text>
							</HStack>
						)
					}
					{hasTax ? (
						<ErrorBoundary>
							<Taxes totalTax={total_tax} taxLines={tax_lines} />
						</ErrorBoundary>
					) : null}
				</VStack>
			) : null}
			<CustomerNote />
		</>
	);
};
