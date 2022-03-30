import * as React from 'react';
import forEach from 'lodash/forEach';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import { FormContextProvider } from './context';
import { ErrorList } from './error-list';
import { toErrorList } from './validate';
import { NodeTemplate } from './templates/node';
import { toIdSchema, getDefaultFormState } from './form.helpers';

import type { Schema, UiSchema, ErrorSchema } from './types';

export interface FormProps<T> {
	formData: T;
	schema: Schema;
	uiSchema?: UiSchema;
	extraErrors?: ErrorSchema;
	onChange: (formData: T) => void;
	rootId?: string;
}

/**
 *
 */
export const Form = <T extends object | string>({
	schema,
	uiSchema = {},
	formData: inputFormData,
	extraErrors = {},
	onChange,
	rootId = 'root',
	...props
}: FormProps<T>) => {
	const formData = Object.freeze(getDefaultFormState(schema, inputFormData));

	/**
	 *
	 */
	const idSchema = React.useMemo(
		() => toIdSchema(schema, null, schema, formData, rootId),
		[formData, rootId, schema]
	);

	/**
	 *
	 */
	const errors = React.useMemo(() => toErrorList(extraErrors), [extraErrors]);

	/**
	 *
	 */
	const handleOnChange = React.useCallback(
		(changes) => {
			let newData = cloneDeep(formData);
			forEach(changes, (value, id) => {
				const path = id.split('.');
				const root = path.shift();
				if (path.length === 0 && root === rootId) {
					// single-field form
					newData = value;
				} else {
					set(newData, path, value);
				}
			});
			if (onChange) {
				onChange(newData);
			}
		},
		[formData, onChange, rootId]
	);

	/**
	 *
	 */
	return (
		<FormContextProvider schema={schema} onChange={handleOnChange}>
			{errors.length > 0 && <ErrorList errors={errors} />}
			<NodeTemplate schema={schema} formData={formData} name={rootId} idSchema={idSchema} />
		</FormContextProvider>
	);
};
