import * as React from 'react';

import { useTheme } from 'styled-components/native';

import Box from '@wcpos/components/src/box';
import Icon from '@wcpos/components/src/icon';
import Pressable from '@wcpos/components/src/pressable';
import Text from '@wcpos/components/src/text';
import TextArea from '@wcpos/components/src/textarea';
import Tooltip from '@wcpos/components/src/tooltip';

import { t } from '../../../../lib/translations';

const CustomerNote = ({ note, order }) => {
	const [isEditing, setIsEditing] = React.useState(false);
	const [value, setValue] = React.useState(note);
	const theme = useTheme();

	/**
	 * Keep textarea value insync with the order.customer_note
	 */
	React.useEffect(() => {
		setValue(note);
	}, [note]);

	/**
	 *
	 */
	const handleSaveNote = React.useCallback(() => {
		const latestDoc = order.getLatest();
		latestDoc.patch({ customer_note: value.replace(/^\s+|\s+$/g, '').trim() });
		setIsEditing(false);
	}, [order, value]);

	/**
	 *
	 */
	return (
		<Box horizontal space="small">
			<Box paddingTop="xxSmall">
				<Tooltip content={t('Customer Note', { _tags: 'core' })}>
					<Icon name="noteSticky" type="secondary" />
				</Tooltip>
			</Box>

			<Box fill>
				{isEditing ? (
					<TextArea value={value} onChangeText={setValue} onBlur={handleSaveNote} blurOnSubmit />
				) : (
					<Pressable onPress={() => setIsEditing(true)}>
						<Text style={{ lineHeight: theme.font.lineHeight.large }}>{note}</Text>
					</Pressable>
				)}
			</Box>
		</Box>
	);
};

export default CustomerNote;