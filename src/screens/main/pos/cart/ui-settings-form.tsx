import * as React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useObservableState } from 'observable-hooks';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Form, FormField, FormSwitch, FormInput } from '@wcpos/tailwind/src/form';
import { VStack } from '@wcpos/tailwind/src/vstack';

import { useT } from '../../../../contexts/translations';
import { columnsFormSchema, UISettingsColumnsForm } from '../../components/ui-settings';
import { useUISettings } from '../../contexts/ui-settings';

export const schema = z.object({
	autoShowReceipt: z.boolean(),
	autoPrintReceipt: z.boolean(),
	// quickDiscounts: z.array(z.number()).optional(),
	quickDiscounts: z.string().optional(),
	...columnsFormSchema.shape,
});

/**
 *
 */
export const UISettingsForm = () => {
	const { uiSettings, getUILabel } = useUISettings('pos-cart');
	const formData = useObservableState(uiSettings.$, uiSettings.get());
	const t = useT();

	/**
	 *
	 */
	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			...formData,
		},
	});

	/**
	 *
	 */
	return (
		<Form {...form}>
			<VStack>
				<FormField
					control={form.control}
					name="autoShowReceipt"
					render={({ field }) => <FormSwitch label={getUILabel('autoShowReceipt')} {...field} />}
				/>
				<FormField
					control={form.control}
					name="autoPrintReceipt"
					render={({ field }) => <FormSwitch label={getUILabel('autoPrintReceipt')} {...field} />}
				/>
				<FormField
					control={form.control}
					name="quickDiscounts"
					render={({ field }) => <FormInput label={getUILabel('quickDiscounts')} {...field} />}
				/>
				<UISettingsColumnsForm form={form} columns={formData.columns} getUILabel={getUILabel} />
			</VStack>
		</Form>
	);
};
