import * as React from 'react';

import get from 'lodash/get';

import Box from '@wcpos/components/src/box';
import Tabs from '@wcpos/components/src/tabs';
import Tree from '@wcpos/components/src/tree';
import Form from '@wcpos/react-native-jsonschema-form';

import { useT } from '../../../contexts/translations';

/**
 *
 */
export const EditFormWithJSONTree = ({ json, schema, uiSchema, onChange }) => {
	const [index, setIndex] = React.useState(0);
	const t = useT();
	const rootName = get(uiSchema, 'ui:rootFieldId', 'root');

	/**
	 *
	 */
	const renderScene = React.useCallback(
		({ route }) => {
			switch (route.key) {
				case 'form':
					return (
						<Box padding="small">
							<Form schema={schema} uiSchema={uiSchema} formData={json} onChange={onChange} />
						</Box>
					);
				case 'json':
					return <Tree data={json} rootName={rootName} />;
				default:
					return null;
			}
		},
		[schema, uiSchema, json, onChange, rootName]
	);

	/**
	 *
	 */
	const routes = React.useMemo(
		() => [
			{ key: 'form', title: t('Form', { _tags: 'core' }) },
			{ key: 'json', title: t('JSON', { _tags: 'core' }) },
		],
		[t]
	);

	/**
	 *
	 */
	return (
		<Tabs<(typeof routes)[number]>
			navigationState={{ index, routes }}
			renderScene={renderScene}
			onIndexChange={setIndex}
		/>
	);
};
