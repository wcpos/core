import * as React from 'react';

import { useObservableEagerState } from 'observable-hooks';

import { Button, ButtonText } from '@wcpos/tailwind/src/button';
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@wcpos/tailwind/src/dialog';
import { Textarea } from '@wcpos/tailwind/src/textarea';

import { useT } from '../../../../../contexts/translations';
import { useLocalMutation } from '../../../hooks/mutations/use-local-mutation';
import { useCurrentOrder } from '../../contexts/current-order';

/**
 *
 */
export const AddNoteButton = () => {
	const { currentOrder } = useCurrentOrder();
	const note = useObservableEagerState(currentOrder.customer_note$);
	const t = useT();
	const { localPatch } = useLocalMutation();
	const [open, setOpen] = React.useState(false);
	const [text, onChangeText] = React.useState(note);

	/**
	 *
	 */
	const handleSave = React.useCallback(async () => {
		await localPatch({
			document: currentOrder,
			data: {
				customer_note: text,
			},
		});
		setOpen(false);
	}, [currentOrder, localPatch, text]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<ButtonText numberOfLines={1}>{t('Order Note', { _tags: 'core' })}</ButtonText>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t('Order Note', { _tags: 'core' })}</DialogTitle>
				</DialogHeader>
				<DialogDescription>
					<Textarea autoFocus value={text} onChangeText={onChangeText} />
				</DialogDescription>
				<DialogFooter>
					<Button onPress={handleSave}>
						<ButtonText>{t('Add Note', { _tags: 'core' })}</ButtonText>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
