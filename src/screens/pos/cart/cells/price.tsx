import * as React from 'react';
import { useObservableState } from 'observable-hooks';
import Popover from '@wcpos/components/src/popover';
import Numpad from '@wcpos/components/src/numpad';
import Box from '@wcpos/components/src/box';
import Text from '@wcpos/components/src/text';
import useCurrencyFormat from '@wcpos/hooks/src/use-currency-format';

interface Props {
	item: import('@wcpos/database').LineItemDocument;
}

export const Price = ({ item }: Props) => {
	const price = useObservableState(item.price$, item.price);
	const { format } = useCurrencyFormat({ withSymbol: false });

	const handleChange = async (newValue: string): Promise<void> => {
		item.atomicPatch({ price: Number(newValue) });
	};

	return (
		<Popover content={<Numpad initialValue={String(price)} onChange={handleChange} />}>
			<Box border paddingY="xSmall" paddingX="small" rounding="large">
				<Text>{format(price)}</Text>
			</Box>
		</Popover>
	);
};