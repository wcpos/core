import * as React from 'react';
import Format from '@wcpos/react-native-jsonschema-format';
// import useStore from '@wcpos/hooks/src/use-store';

interface Props {
	item: any;
	column: any;
}

export const FormattedPrice = ({ item, column }: Props) => {
	// const { userDB, storeID } = useStore();
	// const [currency, setCurrency] = React.useState();

	// // get currency settings
	// React.useEffect(() => {
	// 	async function fetchStore() {
	// 		if (storeID) {
	// 			const store = await userDB?.collections.stores.findOne(storeID).exec();
	// 			setCurrency(store?.accounting.currency);
	// 		}
	// 	}
	// 	fetchStore();
	// }, []);

	return <Format.Currency symbol="$">{item[column.key]}</Format.Currency>;
};

export default FormattedPrice;