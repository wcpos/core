import * as React from 'react';

import { useObservableSuspense, ObservableResource } from 'observable-hooks';
import { isRxDocument } from 'rxdb';

import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalTitle,
	ModalFooter,
	ModalBody,
	ModalClose,
	ModalAction,
} from '@wcpos/components/src/modal';
import { Text } from '@wcpos/components/src/text';
import { VStack } from '@wcpos/components/src/vstack';

import { PaymentWebview } from './components/payment-webview';
import CheckoutTitle from './components/title';
import { useT } from '../../../../contexts/translations';
import useModalRefreshFix from '../../../../hooks/use-modal-refresh-fix';

interface Props {
	resource: ObservableResource<import('@wcpos/database').OrderDocument>;
}

/**
 *
 */
const Checkout = ({ resource }: Props) => {
	const order = useObservableSuspense(resource);
	const t = useT();
	const iframeRef = React.useRef<HTMLIFrameElement>();
	useModalRefreshFix();

	/**
	 *
	 */
	const handleProcessPayment = React.useCallback(() => {
		if (iframeRef.current && iframeRef.current.contentWindow) {
			iframeRef.current.contentWindow.postMessage({ action: 'wcpos-process-payment' }, '*');
		}
	}, []);

	/**
	 *
	 */
	if (!isRxDocument(order)) {
		return (
			<Modal>
				<ModalContent size="lg">
					<ModalHeader>
						<ModalTitle>
							<Text>{t('No order found', { _tags: 'core' })}</Text>
						</ModalTitle>
					</ModalHeader>
				</ModalContent>
			</Modal>
		);
	}

	/**
	 *
	 */
	return (
		<Modal>
			<ModalContent size="xl" className="h-full">
				<ModalHeader>
					<ModalTitle>
						<Text>{t('Checkout', { _tags: 'core' })}</Text>
					</ModalTitle>
				</ModalHeader>
				<ModalBody contentContainerStyle={{ height: '100%' }}>
					<VStack className="flex-1">
						<CheckoutTitle order={order} />
						<PaymentWebview order={order} ref={iframeRef} />
					</VStack>
				</ModalBody>
				<ModalFooter>
					<ModalClose>{t('Cancel', { _tags: 'core' })}</ModalClose>
					<ModalAction onPress={handleProcessPayment}>
						{t('Process Payment', { _tags: 'core' })}
					</ModalAction>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default Checkout;
