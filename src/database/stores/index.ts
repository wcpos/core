import createProductsCollection from './products';
import createProductVariationsCollection from './variations';
import createOrdersCollection from './orders';
import createOrderLineItemsCollection from './orders/line-items';
import createOrderFeeLinesCollection from './orders/fee-lines';
import createOrderShippingLinesCollection from './orders/shipping-lines';
import createCustomersCollection from './customers';

export default [
	createProductsCollection,
	createProductVariationsCollection,
	createOrdersCollection,
	createOrderLineItemsCollection,
	createOrderFeeLinesCollection,
	createOrderShippingLinesCollection,
	createCustomersCollection,
];