import { useSubscription } from 'observable-hooks';

import { Toast } from '@wcpos/components/src/toast';

import { useT } from '../../../contexts/translations';
import { useBarcodeDetection, useBarcodeSearch } from '../hooks/barcodes';

type ProductCollection = import('@wcpos/database').ProductCollection;
type Query = import('@wcpos/query').RelationalQuery<ProductCollection>;

export const useBarcode = (productQuery: Query) => {
	const { barcode$ } = useBarcodeDetection();
	const { barcodeSearch } = useBarcodeSearch();
	const t = useT();

	/**
	 *
	 */
	useSubscription(barcode$, async (barcode) => {
		let message = t('Barcode scanned: {barcode}', { barcode, _tags: 'core' });
		const results = await barcodeSearch(barcode);

		if (results.length === 1) {
			message += ', ' + t('1 product found locally', { _tags: 'core' });
		}

		if (results.length === 0 || results.length > 1) {
			message +=
				', ' + t('{count} products found locally', { count: results.length, _tags: 'core' });
		}

		Toast.show({ text1: message, type: 'info' });
		productQuery.search(barcode);
	});
};
