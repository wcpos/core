import * as React from 'react';

import { useObservableState } from 'observable-hooks';

import Box from '@wcpos/components/src/box';
import Text from '@wcpos/components/src/text';
import Tooltip from '@wcpos/components/src/tooltip';

import { useAppState } from '../../../../contexts/app-state';
import { useTaxHelpers } from '../../contexts/tax-helpers';
import useCurrencyFormat from '../../hooks/use-currency-format';

interface Props {
	price: string;
	taxStatus: string;
	taxClass: string;
	taxDisplay: 'text' | 'tooltip' | 'none';
	strikethrough?: boolean;
	taxLocation: 'pos' | 'base';
}

export const Price = ({
	price,
	taxStatus,
	taxClass,
	taxDisplay = 'tooltip',
	strikethrough,
	taxLocation,
}: Props) => {
	const { format } = useCurrencyFormat();
	const { store } = useAppState();
	const taxDisplayShop = useObservableState(store?.tax_display_shop$, store?.tax_display_shop);
	const calcTaxes = useObservableState(store?.calc_taxes$, store?.calc_taxes);
	const taxable = taxStatus === 'taxable' && calcTaxes === 'yes';
	const { getDisplayValues } = useTaxHelpers();

	let displayPrice = price;
	let taxTotal = 0;

	if (taxable) {
		const result = getDisplayValues(price, taxClass, taxDisplayShop);
		displayPrice = result.displayPrice;
		taxTotal = result.taxTotal;
	}

	/**
	 * Show price with tax available as tooltip
	 */
	if (taxDisplay === 'tooltip' && taxable) {
		return (
			<Tooltip content={`${taxDisplayShop === 'incl' ? 'incl.' : 'excl.'} ${format(taxTotal)} tax`}>
				<Text
					style={
						strikethrough
							? { textDecorationLine: 'line-through', textDecorationStyle: 'solid' }
							: {}
					}
					type={strikethrough ? 'secondary' : undefined}
				>
					{format(displayPrice)}
				</Text>
			</Tooltip>
		);
	}

	/**
	 * Show price and tax
	 */
	if (taxDisplay === 'text' && taxable) {
		return (
			<Box space="xSmall" align="end">
				<Text
					style={
						strikethrough
							? { textDecorationLine: 'line-through', textDecorationStyle: 'solid' }
							: {}
					}
					type={strikethrough ? 'textMuted' : undefined}
				>
					{format(displayPrice)}
				</Text>
				<Text type="textMuted" size="small">
					{`${taxDisplayShop === 'incl' ? 'incl.' : 'excl.'} ${format(taxTotal)} tax`}
				</Text>
			</Box>
		);
	}

	// default just show the displayPrice
	return <Text>{format(displayPrice)}</Text>;
};

export default Price;
