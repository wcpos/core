import * as React from 'react';
import Modal from '@wcpos/common/src/components/modal';
import Button from '@wcpos/common/src/components/button';
import Segment from '@wcpos/common/src/components/segment';
import TextInput from '@wcpos/common/src/components/textinput';
import http from '@wcpos/common/src/lib/http';

type UserDocument = import('@wcpos/common/src/database/users').UserDocument;
type SiteDocument = import('@wcpos/common/src/database/sites').SiteDocument;

interface ILoginModalProps {
	visible: boolean;
	setVisible: (visible: boolean) => void;
	site: SiteDocument;
	user: UserDocument;
}

const LoginModal = ({ visible, setVisible, site, user }: ILoginModalProps) => {
	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState('');

	const handleLogin = async () => {
		if (site && site.wpApiUrl) {
			const result = await http.post(`${site.wpApiUrl}wcpos/v1/jwt/authorize`, {
				username,
				password,
			});
			// set wp credientials
			const wpUser = await site.addOrUpdateWpCredentials(result.data);
			if (wpUser.jwt) {
				setVisible(false);
			}
		}
	};

	return (
		<Modal visible={visible}>
			<Segment>
				<TextInput placeholder="username" value={username} onChangeText={setUsername} />
				<TextInput placeholder="password" value={password} onChangeText={setPassword} />
				<Button title="Login" onPress={handleLogin} />
			</Segment>
			<Button
				title="Close Modal"
				onPress={() => {
					setVisible(false);
				}}
			/>
		</Modal>
	);
};

export default LoginModal;