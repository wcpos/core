import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Popover from '@wcpos/common/src/components/popover';
import Icon from '@wcpos/common/src/components/icon';
import Checkbox from '@wcpos/common/src/components/checkbox';
import Button from '@wcpos/common/src/components/button';
import Text from '@wcpos/common/src/components/text';

interface UiSettingsProps {
	ui: import('@wcpos/common/src/hooks/use-ui/use-ui').UIDocument;
}

const UiSettings = ({ ui }: UiSettingsProps) => {
	const { t } = useTranslation();
	const key = ui.id.split('_')[1];
	const columns = ui.get('columns');
	const [visible, setVisible] = React.useState(false);

	return (
		<Popover
			open={visible}
			activator={<Icon name="cog" onPress={() => setVisible(true)} />}
			onRequestClose={() => setVisible(false)}
		>
			<Text>Columns</Text>
			{columns.map((column: any, index: number) => {
				return (
					<>
						<Checkbox
							key={column.key}
							label={t(`${key}.column.label.${column.key}`)}
							checked={!column.hide}
							onChange={(checked) => {
								columns[index] = { ...column, hide: !checked };
								ui.atomicSet('columns', columns);
							}}
						/>
						{column.display
							? column.display.map((display: any, i: number) => (
									// eslint-disable-next-line react/jsx-indent
									<Checkbox
										key={display.key}
										label={t(`${key}.column.label.${display.key}`)}
										checked={!display.hide}
										onChange={(checked) => {
											column.display[i] = { ...display, hide: !checked };
											ui.atomicSet('columns', columns);
										}}
									/>
							  ))
							: null}
					</>
				);
			})}
			<Button title="Restore Default Settings" onPress={ui.reset} />
		</Popover>
	);
};

export default UiSettings;