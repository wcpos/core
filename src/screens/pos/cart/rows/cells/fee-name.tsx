import * as React from 'react';
import { useObservableState } from 'observable-hooks';
import Text from '@wcpos/common/src/components/text';

interface Props {
	item: import('@wcpos/common/src/database').FeeLineDocument;
}

const FeeName = ({ item }: Props) => {
	const name = useObservableState(item.name$, item.name);
	return <Text>{name}</Text>;
};

export default FeeName;