import React from 'react';
import Button from '../../../../../../components/button';
import Popover from '../../../../../../components/popover';
import Variations from './variations';

interface Props {
	product: any;
}

const Actions: React.FC<Props> = ({ product }) => {
	const addToCart = async () => {
		const order = await product.collections().orders.findOne().exec();
		order.addOrUpdateLineItem(product);
	};

	if (product.isVariable()) {
		return (
			<Popover content={<Variations product={product} addToCart={addToCart} />}>
				<Button title="->" />
			</Popover>
		);
	}

	return (
		<Button
			title="+"
			onPress={() => {
				addToCart();
			}}
		/>
	);
};

export default Actions;