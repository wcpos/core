import * as React from 'react';

import { StackActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ObservableResource } from 'observable-hooks';
import { from } from 'rxjs';

import { useQuery } from '@wcpos/query';
import { ErrorBoundary } from '@wcpos/tailwind/src/error-boundary';
import { Suspense } from '@wcpos/tailwind/src/suspense';

import AddProduct from './add-product';
import EditProduct from './edit-product';
import EditVariation from './edit-variation';
import Products from './products';
import { useT } from '../../../contexts/translations';
import { ModalLayout } from '../../components/modal-layout';
import { TaxRatesProvider } from '../contexts/tax-rates';
import { useCollection } from '../hooks/use-collection';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type ProductsStackParamList = {
	Products: undefined;
	AddProduct: undefined;
	EditProduct: { productID: string };
	EditVariation: { parentID: string; variationID: string };
};

const Stack = createStackNavigator<ProductsStackParamList>();

/**
 * TODO: move the Products provider here
 */
const ProductsWithProviders = () => {
	/**
	 *
	 */
	const taxQuery = useQuery({
		queryKeys: ['tax-rates'],
		collectionName: 'taxes',
	});

	return (
		<ErrorBoundary>
			<Suspense>
				<TaxRatesProvider taxQuery={taxQuery}>
					<Suspense>
						<Products />
					</Suspense>
				</TaxRatesProvider>
			</Suspense>
		</ErrorBoundary>
	);
};

/**
 *
 */
const AddProductModal = ({
	navigation,
}: NativeStackScreenProps<ProductsStackParamList, 'AddProduct'>) => {
	const t = useT();

	return (
		<ModalLayout
			title={t('Add Product', { _tags: 'core' })}
			primaryAction={{ label: t('Save to Server', { _tags: 'core' }) }}
			secondaryActions={[
				{
					label: t('Cancel', { _tags: 'core' }),
					action: () => navigation.dispatch(StackActions.pop(1)),
				},
			]}
		>
			<AddProduct />
		</ModalLayout>
	);
};

/**
 *
 */
const EditProductWithProviders = ({
	route,
	navigation,
}: NativeStackScreenProps<ProductsStackParamList, 'EditProduct'>) => {
	const { productID } = route.params;
	const { collection } = useCollection('products');
	const t = useT();

	const resource = React.useMemo(
		() => new ObservableResource(from(collection.findOneFix(productID).exec())),
		[collection, productID]
	);

	/**
	 * I need tax provider just to get the tax classes
	 * @TODO - tax classes should come from WC API
	 */
	const taxQuery = useQuery({
		queryKeys: ['tax-rates'],
		collectionName: 'taxes',
	});

	return (
		<ModalLayout
			title={t('Edit', { _tags: 'core' })}
			secondaryActions={[
				{
					label: t('Cancel', { _tags: 'core' }),
					action: () => navigation.dispatch(StackActions.pop(1)),
				},
			]}
		>
			<Suspense>
				<TaxRatesProvider taxQuery={taxQuery}>
					<Suspense>
						<EditProduct resource={resource} />
					</Suspense>
				</TaxRatesProvider>
			</Suspense>
		</ModalLayout>
	);
};

/**
 *
 */
const EditVariationWithProviders = ({
	route,
	navigation,
}: NativeStackScreenProps<ProductsStackParamList, 'EditVariation'>) => {
	const { variationID, parentID } = route.params;
	const { collection } = useCollection('variations');
	const t = useT();

	const resource = React.useMemo(
		() => new ObservableResource(from(collection.findOneFix(variationID).exec())),
		[collection, variationID]
	);

	/**
	 * I need tax provider just to get the tax classes
	 * @TODO - tax classes should come from WC API
	 */
	const taxQuery = useQuery({
		queryKeys: ['tax-rates'],
		collectionName: 'taxes',
	});

	/**
	 *
	 */
	return (
		<ModalLayout
			title={t('Edit Variation', { _tags: 'core' })}
			secondaryActions={[
				{
					label: t('Cancel', { _tags: 'core' }),
					action: () => navigation.dispatch(StackActions.pop(1)),
				},
			]}
		>
			<Suspense>
				<TaxRatesProvider taxQuery={taxQuery}>
					<Suspense>
						<EditVariation resource={resource} />
					</Suspense>
				</TaxRatesProvider>
			</Suspense>
		</ModalLayout>
	);
};

/**
 *
 */
const ProductsNavigator = () => {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="Products" component={ProductsWithProviders} />
			<Stack.Group screenOptions={{ presentation: 'transparentModal' }}>
				<Stack.Screen name="AddProduct" component={AddProductModal} />
				<Stack.Screen name="EditProduct" component={EditProductWithProviders} />
				<Stack.Screen name="EditVariation" component={EditVariationWithProviders} />
			</Stack.Group>
		</Stack.Navigator>
	);
};

export default ProductsNavigator;
